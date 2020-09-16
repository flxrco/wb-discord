import { Controller, Inject } from '@nestjs/common'
import {
  Client,
  Guild,
  TextChannel,
  DiscordAPIError,
  Message,
} from 'discord.js'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { from } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import {
  IPendingQuote,
  QuoteWatchInteractor,
} from 'src/common/classes/interactors/quote-watch-interactor.class'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import _ = require('lodash')
import moment = require('moment-timezone')

const CONCURRENT_SERVERS = 3
const CONCURRENT_CHANNELS_PER_SERVER = 3

@Controller()
export class QuoteRewatchController {
  private logger: Logger
  constructor(
    private watchSvc: ReactionsWatcherService,
    private watchInt: QuoteWatchInteractor,
    private client: Client,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'QuoteRewatchController' })
    this.processGuilds()
  }

  private async processGuilds() {
    await from(this.client.guilds.cache.values())
      .pipe(
        mergeMap(guild => from(this.processGuild(guild)), CONCURRENT_SERVERS)
      )
      .toPromise()

    this.logger.info('Finished the rewatching routine.')
  }

  private async processGuild(guild: Guild) {
    const [pendingMap, channelMap] = await Promise.all([
      this.fetchQuotesAndGroupByChannel(guild),
      this.getIndexedTextChannels(guild),
    ])

    return from(Object.keys(pendingMap))
      .pipe(
        /*
         * `channelId` is the arg name because the keys of the `pending` map are channel ids.
         
         * Only channels associated with pending quotes in the database will be processed. Which channels
         * perform processing on is dicated by the `pendingMap` map. Its keys are channel ids and
         * the value are populated arrays of the pending quotes. Only channels their id as a key in the
         * map are the ones which will be processed.
         * 
         * We can only process a certain amount of channels at a time, and that depends on
         * the value of `CONCURRENT_PROCESSES`.
         */
        mergeMap(channelId => {
          const pendingArr = pendingMap[channelId]
          const channel = channelMap[channelId]

          return this.watchChannelMessages(channel, pendingArr)
        }, CONCURRENT_CHANNELS_PER_SERVER)
      )
      .toPromise()
  }

  private async fetchQuotesAndGroupByChannel({
    id,
  }: Guild): Promise<GroupedPendingQuoteMap> {
    const found = await this.watchInt.getPendingQuotes(id)
    const indexed: GroupedPendingQuoteMap = found.reduce((map, pending) => {
      const { channelId } = pending.submissionStatus

      if (map[channelId] === undefined) {
        map[channelId] = []
      }

      map[channelId].push(pending)
      return map
    }, {})

    for (const channelId in indexed) {
      indexed[channelId].sort((a, b) => {
        return (
          new Date(a.submissionStatus.messageDt).getTime() -
          new Date(b.submissionStatus.messageDt).getTime()
        )
      })
    }

    return indexed
  }

  private async getIndexedTextChannels({
    channels,
  }: Guild): Promise<IndexedTextChannels> {
    return [...channels.cache.values()]
      .filter(({ type, viewable }) => type === 'text' && viewable)
      .map(data => data as TextChannel)
      .reduce((map, channel) => {
        map[channel.id] = channel
        return map
      }, {})
  }

  private async flagAsLost(pending: IPendingQuote): Promise<void> {
    const { quote, submissionStatus } = pending
    await this.watchInt.flagAsLost(submissionStatus.messageId)
    this.logger.warn(
      `Lost message for quote ${quote.quoteId} in channel ${submissionStatus.channelId} of guild ${quote.serverId}.`
    )
  }

  private async watchSubmission(
    pending: IPendingQuote,
    message: Message
  ): Promise<void> {
    /*
     * We're not going to wait for this observable to finish because the only times that it
     * will finish is if the quote was approved or rejected by any means.
     *
     * Anyways, this doesn't matter since watchSubmission does a local operation and the
     * watch is guaranteed to be created instantly.
     */
    this.watchSvc.watchSubmission(pending, message)
    const { channel, guild } = message
    const { quote } = pending
    this.logger.debug(
      `Rewatching quote ${quote.quoteId} in channel ${channel.id} of guild ${guild.id}.`
    )
  }

  private async retreiveMessages(
    { messages }: TextChannel,
    pendingQuotes: IPendingQuote[]
  ): Promise<MessageSearchResults> {
    const indexedByMsgId = _.keyBy(
      pendingQuotes,
      p => p.submissionStatus.messageId
    )
    const foundMessages: MessageMap = {}

    const lostIds: string[] = []
    const foundIds: string[] = []
    let indeterminateIds = pendingQuotes.map(
      ({ submissionStatus }) => submissionStatus.messageId
    )

    while (indeterminateIds.length) {
      const anchorId = indeterminateIds[0]
      try {
        // the message starting from the anchor to whatever discord allows us to query
        const fetchResults = [
          await messages.fetch(anchorId),
          ...(await messages.fetch({ after: anchorId })).values(),
        ]
          // filter out the messages that we don't need -- those which are not for tracking approvals
          .filter(({ id }) => !!indexedByMsgId[id])
          // to be sure, sort them by creation/edit dates. this sequence is important later on.
          .sort(
            (a, b) =>
              (a.editedTimestamp || a.createdTimestamp) -
              (b.editedTimestamp || a.createdTimestamp)
          )

        // push the found messages to the holding area
        fetchResults.forEach(message => {
          foundMessages[message.id] = message
        })
        // push the found ones to the found array
        foundIds.push(...fetchResults.map(({ id }) => id))

        // get the ids of the messages for easy retrieval later on.
        const foundMessagesIdSet = new Set(fetchResults.map(({ id }) => id))

        // remove the found ids from the indeterminate array
        indeterminateIds = indeterminateIds.filter(
          id => !foundMessagesIdSet.has(id)
        )

        // if we've reached this point, there's no way taht foundMessages will be empty. there will be at least one.
        const lastMessage = _.last(fetchResults)
        const lastMessageDt = moment(
          lastMessage.editedAt || lastMessage.createdAt
        )

        const greaterThanLastFoundMessageIdx = indeterminateIds.findIndex(
          id => {
            const messageDt = indexedByMsgId[id].submissionStatus.messageDt
            return moment(messageDt).isSameOrAfter(lastMessageDt)
          }
        )

        if (greaterThanLastFoundMessageIdx === -1) {
          // this means that all of the quotes were lost
          lostIds.push(...indeterminateIds)
          indeterminateIds = []
        } else {
          // this means that only a portion was lost
          lostIds.push(
            ...indeterminateIds.slice(0, greaterThanLastFoundMessageIdx)
          )
          indeterminateIds = indeterminateIds.slice(
            greaterThanLastFoundMessageIdx
          )
        }
      } catch (e) {
        if (!(e instanceof DiscordAPIError) || e.httpStatus !== 404) {
          throw e
        }

        lostIds.push(anchorId)
        indeterminateIds.shift()
      }
    }

    return {
      found: foundIds.map(id => ({
        message: foundMessages[id],
        pending: indexedByMsgId[id],
      })),
      lost: lostIds.map(id => indexedByMsgId[id]),
    }
  }

  private async watchChannelMessages(
    channel: TextChannel,
    quotes: IPendingQuote[]
  ) {
    const results = await this.retreiveMessages(channel, quotes)

    for (const { message, pending } of results.found) {
      await this.watchSubmission(pending, message)
    }

    for (const pending of results.lost) {
      await this.flagAsLost(pending)
    }
  }
}

type GroupedPendingQuoteMap = Record<string, IPendingQuote[]>
type IndexedTextChannels = Record<string, TextChannel>
type MessageMap = Record<string, Message>
interface MessageSearchResults {
  lost: IPendingQuote[]
  found: {
    pending: IPendingQuote
    message: Message
  }[]
}
