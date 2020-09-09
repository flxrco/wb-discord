import { Injectable } from '@nestjs/common'
import { Message, Client } from 'discord.js'
import MessageReactionWrapper from 'src/common/classes/message-reaction-wrapper.class'
import {
  filter,
  mapTo,
  take,
  finalize,
  map,
  share,
  catchError,
} from 'rxjs/operators'
import { timer, of, race, Subject } from 'rxjs'
import { ISubmitQuoteOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'
import IQuote from 'src/common/core/interfaces/models/quote.interface'

@Injectable()
export class ReactionsWatcherService {
  constructor(private client: Client) {}

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
    { quote, approvalStatus }: ISubmitQuoteOutput,
    message: Message,
    reqs: IEmojiRequirements
  ) {
    // create the watcher and map more contexts with its boolean results
    const watcher$ = this.createMessageWatcher(
      message,
      reqs,
      new Date(approvalStatus.expireDt)
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
    { emoji, amount }: IEmojiRequirements,
    expireDt: Date
  ) {
    const now = new Date()

    // automatically emit false if the expiration date has lapsed
    if (now > expireDt) {
      return of(false)
    }

    const { bot } = this
    const wrapper = MessageReactionWrapper.wrap(
      message,
      (r, u) => r.emoji.name === emoji && u.id !== bot.id
    )

    // this observable will emit if we've reache the amount of reactions that we need
    const reactionComplete$ = wrapper.reactions$.pipe(
      filter(rm => {
        const reactors = rm[emoji] || []
        return reactors.filter(id => id !== bot.id).length === amount
      }),
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
