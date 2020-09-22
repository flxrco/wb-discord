import { Inject, Injectable } from '@nestjs/common'
import { Message, Client } from 'discord.js'
import MessageReactionWrapper from 'src/common/classes/message-reaction-wrapper.class'
import { filter, mapTo, take, finalize, map, share } from 'rxjs/operators'
import { timer, of, race, Subject } from 'rxjs'
import { IPendingQuote } from 'src/common/classes/interactors/quote-watch-interactor.class'
import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'
import IQuote from 'src/common/interfaces/models/quote.interface'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

@Injectable()
export class ReactionsWatcherService {
  private logger: Logger

  constructor(
    private client: Client,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'ReactionsWatcherService' })
  }

  private get bot() {
    return this.client.user
  }

  private readonly resultSubject = new Subject<IInternalWatcherResultPayload>()

  /**
   *
   * @param param0 An object containing the quote and details about its expiration.
   * @param message The message object we need to watch for reactions.
   * @param param2 The amount of a certain emoji a message needs to get to be considered as approved.
   * @returns A hot observable which emits true if the message reached the required emojis and
   *    false if the expiration date has lapsed.
   */
  watchSubmission(
    { quote, submissionStatus }: IPendingQuote,
    message: Message
  ) {
    // create the watcher and map more contexts with its boolean results
    const watcher$ = this.createMessageWatcher(
      message,
      submissionStatus.requirements,
      new Date(submissionStatus.expireDt)
    ).pipe(share())

    // map the emission of the watcher and then send it to the result subject for broadcasting
    watcher$
      .pipe(
        map<boolean, IInternalWatcherResultPayload>(didComplete => {
          return {
            didComplete,
            message,
            quote,
          }
        })
      )
      .subscribe(data => this.resultSubject.next(data))

    // if we dont use share(), two watchers for a single message will be created
    return watcher$
  }

  /**
   * Emits the submissions which completed their emoji requirements.
   */
  get success$() {
    return this.resultSubject.asObservable().pipe(filter(d => d.didComplete))
  }

  /**
   * Emits the submissions which failed to reach their emoji requriements before
   * their expiration dates.
   */
  get expire$() {
    return this.resultSubject.asObservable().pipe(filter(d => !d.didComplete))
  }

  /**
   * Creates an observable which resolves if the current time is greater
   * than the expiration date or if the required amount of reaction of a specific
   * emoji has been reached.
   * @param message
   * @param emoji
   * @param count
   * @param expireDt
   */
  private createMessageWatcher(
    message: Message,
    { emoji, count }: IApprovalRequirements,
    expireDt: Date
  ) {
    const now = new Date()

    // automatically emit false if the expiration date has lapsed
    if (now > expireDt) {
      return of(false)
    }

    const wrapper = MessageReactionWrapper.wrap(message, emoji)

    // for logging
    wrapper.changes$.subscribe(({ userId, type, emoji }) => {
      this.logger.silly(`Reaction changes detected.`, {
        userId,
        type,
        emoji,
        messageId: message.id,
        guildId: message.guild.id,
        channelId: message.channel.id,
      })
    })

    // this observable will emit if we've reache the amount of reactions that we need
    const reactionComplete$ = wrapper.reactions$.pipe(
      filter(arr => arr.length === count),
      mapTo(true)
    )

    // this one will emit if we've lapsed the expiration date
    const lapsedExpireDt$ = timer(expireDt.getTime() - now.getTime()).pipe(
      take(1),
      mapTo(false)
    )

    return race(lapsedExpireDt$, reactionComplete$).pipe(
      // once either observable has emitted, the wrapper gets killed to prevent memory leaks
      finalize(() => wrapper.kill())
    )
  }
}

interface IInternalWatcherResultPayload extends IWatcherResultPayload {
  didComplete: boolean
}

export interface IWatcherResultPayload {
  message: Message
  quote: IQuote
}
