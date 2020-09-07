import { Injectable } from '@nestjs/common'
import { Message, Client, Emoji } from 'discord.js'
import MessageReactionWrapper from 'src/common/classes/message-reaction-wrapper.class'
import { filter, mapTo, take, finalize, map, share } from 'rxjs/operators'
import { timer, of, race, Subject } from 'rxjs'
import { ISubmitQuoteOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'
import { GuildUtilsService } from '../guild-utils/guild-utils.service'
import IQuote from 'src/common/core/interfaces/models/quote.interface'

@Injectable()
export class ReactionsWatcherService {
  constructor(private client: Client, private guildUtils: GuildUtilsService) {}

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
  async watchSubmission(
    { quote, approvalStatus }: ISubmitQuoteOutput,
    message: Message,
    { identifier, amount }: IEmojiRequirements
  ) {
    const emoji = await this.guildUtils.getEmoji(
      identifier,
      'identifier',
      message.guild.id
    )

    // create the watcher and map more contexts with its boolean results
    const watcher$ = this.createMessageWatcher(
      message,
      emoji,
      amount,
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
      .subscribe(this.resultSubject.next.bind(this))

    // if we dont use share(), two watchers for a single message will be created
    return watcher$
  }

  /**
   * Emits the submissions which completed their emoji requirements.
   */
  get success$() {
    return this.resultSubject.asObservable().pipe(map(d => d.didComplete))
  }

  /**
   * Emits the submissions which failed to reach their emoji requriements before
   * their expiration dates.
   */
  get expire$() {
    return this.resultSubject.asObservable().pipe(map(d => !d.didComplete))
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
    emoji: Emoji,
    count: number,
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
      (r, u) => r.emoji.id === emoji.id && u.id !== bot.id
    )

    // this observable will emit if we've reache the amount of reactions that we need
    const reactionComplete$ = wrapper.reactions$.pipe(
      filter(rm => {
        const reactors = rm[emoji.id] || []
        return reactors.filter(id => id !== bot.id).length === count
      }),
      mapTo(true)
    )

    // this one will emit if we've lapsed the expiration date
    const lapsedExpireDt$ = timer(
      expireDt.getMilliseconds() - now.getMilliseconds()
    ).pipe(take(1), mapTo(false))

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
