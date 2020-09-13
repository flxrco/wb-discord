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

const CONCURRENT_SERVERS = 5
const CONCURRENT_CHANNELS_PER_SERVER = 5
const CONCURRENT_MESSAGES_PER_CHANNEL = 5

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
  }: Guild): Promise<PendingQuoteMap> {
    const found = await this.watchInt.getPendingQuotes(id)
    return found.reduce((map, pending) => {
      const { channelId } = pending.submissionStatus

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async flagAsLost(pending: IPendingQuote): Promise<void> {
    // noop
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
  }

  private async processPendingQuote(
    channel: TextChannel,
    pending: IPendingQuote
  ): Promise<void> {
    const { messages, guild } = channel
    const { quote } = pending
    try {
      const { submissionStatus } = pending
      const message = await messages.fetch(submissionStatus.messageId)
      await this.watchSubmission(pending, message)
      this.logger.debug(
        `Rewatching quote ${quote.quoteId} in channel ${channel.id} of guild ${guild.id}.`
      )
    } catch (e) {
      if (!(e instanceof DiscordAPIError) || e.httpStatus !== 404) {
        throw e
      }

      await this.flagAsLost(pending)
      this.logger.warn(
        `Lost message for quote ${quote.quoteId} in  in channel ${channel.id} of guild ${guild.id}.`
      )
    }
  }

  private watchChannelMessages(channel: TextChannel, quotes: IPendingQuote[]) {
    return from(quotes).pipe(
      /*
       * For each quote in the array, try fetching it from the channel's message
       * manager. That's an async function.
       */
      mergeMap(
        pending => from(this.processPendingQuote(channel, pending)),
        // we're only allowing a certain amount of fetches at a time. check CONCURRENT_PROCESSES.
        CONCURRENT_MESSAGES_PER_CHANNEL
      )
    )
  }
}

type PendingQuoteMap = Record<string, IPendingQuote[]>
type IndexedTextChannels = Record<string, TextChannel>
