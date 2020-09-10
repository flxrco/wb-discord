import { Controller } from '@nestjs/common'
import { QuoteSubmitInteractorService } from 'src/interactors/quote-submit-interactor/quote-submit-interactor.service'
import { Client, Guild, TextChannel } from 'discord.js'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { IGetPendingQuotesOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'
import { from } from 'rxjs'
import { mergeMap, tap, filter, map } from 'rxjs/operators'

const CONCURRENT_PROCESSES = 5

@Controller()
export class QuoteRewatchController {
  constructor(
    private watchSvc: ReactionsWatcherService,
    private submitInt: QuoteSubmitInteractorService,
    private client: Client
  ) {
    this.processGuilds()
  }

  private async processGuilds() {
    await from(this.client.guilds.cache.values())
      .pipe(
        mergeMap(guild => from(this.processGuild(guild)), CONCURRENT_PROCESSES)
      )
      .toPromise()
  }

  private async processGuild(guild: Guild) {
    // to change
    const emojiReqs: IEmojiRequirements = {
      emoji: '🤔',
      amount: 1,
    }

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

          return this.watchChannelMessages(channel, pendingArr, emojiReqs)
        }, CONCURRENT_PROCESSES)
      )
      .toPromise()
  }

  private async fetchQuotesAndGroupByChannel({
    id,
  }: Guild): Promise<PendingQuoteMap> {
    const found = await this.submitInt.getPendingQuotes(id)
    return found.reduce((map, pending) => {
      const { channelId } = pending.approvalStatus

      if (map[channelId] === undefined) {
        map[channelId] = []
      }

      map[channelId].push(pending)
      return map
    }, {})
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

  private watchChannelMessages(
    { messages }: TextChannel,
    quotes: IGetPendingQuotesOutput,
    emojiReqs: IEmojiRequirements
  ) {
    return from(quotes).pipe(
      /*
       * For each quote in the array, try fetching it from the channel's message
       * manager. That's an async function.
       */
      mergeMap(
        pending =>
          from(messages.fetch(pending.approvalStatus.messageId)).pipe(
            map(message => ({ pending, message }))
          ),
        // we're only allowing a certain amount of fetches at a time. check CONCURRENT_PROCESSES.
        CONCURRENT_PROCESSES
      ),
      // every fetch will flow to this filter function. if a message wasn't found, their process will stop here
      filter(({ message }) => !!message),
      // a fetch will reach this point if the message for that pending quote was found. after it's been found, we'll watch it for reactions.
      tap(({ pending, message }) => {
        this.watchSvc.watchSubmission(pending, message, emojiReqs)
      })
    )
  }
}

type PendingQuoteMap = Record<string, IGetPendingQuotesOutput>
type IndexedTextChannels = Record<string, TextChannel>
