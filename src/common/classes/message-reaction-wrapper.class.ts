import {
  ReactionCollector,
  Message,
  Snowflake,
  MessageReaction,
  User,
} from 'discord.js'
import { fromEvent, of, Observable, merge, NEVER, from } from 'rxjs'
import { takeUntil, map, mapTo, mergeMap, shareReplay } from 'rxjs/operators'

/**
 * This class' purpose is to wrap around the ReactionCollector class from `discord.js`
 * with `RxJS`.
 */
export default class MessageReactionWrapper {
  static wrap(message: Message, targetEmoji: string) {
    return new MessageReactionWrapper(message, targetEmoji)
  }

  private collector: ReactionCollector
  private fetched$: Observable<void>

  /**
   *
   * @param message
   * @param targetEmoji Should be the unicode of a standard emoji. This is the emoji that we'll look out for.
   */
  private constructor(private message: Message, private targetEmoji: string) {
    this.collector = message.createReactionCollector(
      (r, u) => r.emoji.name === targetEmoji && u.id !== this.client.user.id
    )

    this.fetched$ = this.fetchReactions()
  }

  private get client() {
    return this.message.client
  }

  /**
   * Emits and completes once the wrapper's internal collector has ended.
   * If it's already ended,  the emission and completion will happen upon subscription.
   */
  get end$() {
    const { collector } = this
    if (collector.ended) {
      return of(null).pipe(mapTo(undefined))
    }
    return fromEvent(collector, 'end').pipe(mapTo(undefined))
  }

  private fetchReactions(): Observable<void> {
    return merge(NEVER, of(undefined)).pipe(
      mergeMap(() => from(this.getMessageReactions())),
      mapTo(undefined),
      shareReplay()
    )
  }

  private async getMessageReactions(preventApiCall?: boolean) {
    const { targetEmoji, message, client } = this
    const reactions = message.reactions.cache
    const messageReaction = reactions.find(r => r.emoji.name === targetEmoji)

    // don't bother proceeding if no one has reacted using the target emoji yet
    if (!messageReaction) {
      return []
    }

    if (!preventApiCall) {
      /*
       * Fetch the list of the users who reacted using the target emoji and
       * extract their ids. Make sure to leave out the id of the bot.
       */
      await messageReaction.users.fetch()
    }

    return messageReaction.users.cache
      .filter(user => user.id !== client.user.id)
      .mapValues(user => user.id)
      .array()
  }

  /**
   * Ends the internal collector of the wrapper. When this happens, anything subscribed to end$ will receive
   * an emission. Instances of change$ and reactions$ will also instantly complete.
   */
  kill(): boolean {
    const { collector } = this
    if (collector.ended) {
      return true
    }

    collector.stop()
    return false
  }

  private generateMapOperator(type: ReactionChangeType) {
    return map<[MessageReaction, User], ReactionChange>(([r, u]) => ({
      type,
      emoji: r.emoji && r.emoji.name,
      userId: u.id,
    }))
  }

  /**
   *
   */
  get changes$() {
    const { collector, end$ } = this

    const collect$ = fromEvent(collector, 'collect').pipe(
      this.generateMapOperator(ReactionChangeType.COLLECT)
    )
    const remove$ = fromEvent(collector, 'remove').pipe(
      this.generateMapOperator(ReactionChangeType.REMOVE)
    )

    return this.fetched$.pipe(
      mergeMap(() => merge(collect$, remove$)),
      takeUntil(end$)
    )
  }

  /**
   * @see change$
   * Similar to `change$`, but the emission are snapshots of the reaction state.
   */
  get reactions$(): Observable<string[]> {
    const { collector, end$ } = this

    return merge(
      this.fetched$,
      fromEvent(collector, 'collect'),
      fromEvent(collector, 'remove')
    ).pipe(
      takeUntil(end$),
      mergeMap(() => this.getMessageReactions(true))
    )
  }
}

export enum ReactionChangeType {
  COLLECT = 'COLLECT',
  REMOVE = 'REMOVE',
}

export interface ReactionChange {
  userId: Snowflake
  emoji: Snowflake
  type: ReactionChangeType
}
