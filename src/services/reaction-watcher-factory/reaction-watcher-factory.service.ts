import { Injectable } from '@nestjs/common'
import { Snowflake, Message, User } from 'discord.js'
import MessageReactionWrapper from 'src/common/classes/message-reaction-wrapper.class'
import { filter, mapTo, take, finalize } from 'rxjs/operators'
import { timer, of, race } from 'rxjs'

@Injectable()
export class ReactionWatcherFactoryService {
  constructor(private bot: User) {}

  /**
   * Creates an observable which resolves if the current time is greater
   * than the expiration date or if the required amount of reaction of a specific
   * emoji has been reached.
   * @param message
   * @param emojiId
   * @param goalCount
   * @param expireDt
   */
  createMessageWatcher(
    message: Message,
    emojiId: Snowflake,
    goalCount: number,
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
      (r, u) => r.emoji.id === emojiId && u.id !== bot.id
    )

    // this observable will emit if we've reache the amount of reactions that we need
    const reactionComplete$ = wrapper.reactions$.pipe(
      filter(rm => {
        const reactors = rm[emojiId] || []
        return reactors.filter(id => id !== bot.id).length === goalCount
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
