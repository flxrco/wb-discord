import {
  ReactionCollector,
  Message,
  Snowflake,
  MessageReaction,
  User,
} from 'discord.js'
import { fromEvent, of, Observable, merge, from, NEVER } from 'rxjs'
import { takeUntil, map, mapTo, mergeMap, share, tap } from 'rxjs/operators'

/**
 * This class' purpose is to wrap around the ReactionCollector class from `discord.js`
 * with `RxJS`.
 */
export default class MessageReactionWrapper {
  static wrap(message: Message, targetEmoji: string) {
    return new MessageReactionWrapper(message, targetEmoji)
  }

  private reactions = new Set<string>()
  private collector: ReactionCollector
  private _changes$: Observable<ReactionChange>

  /**
   *
   * @param message
   * @param targetEmoji Should be the unicode of a standard emoji. This is the emoji that we'll look out for.
   */
  private constructor(private message: Message, private targetEmoji: string) {
    this.collector = message.createReactionCollector(
      (r, u) => r.emoji.name === targetEmoji && u.id !== this.client.user.id
    )

    this._changes$ = this.createSharedChangesObservable()
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

  private async fetchReactionsFromServer() {
    const { targetEmoji, message, client } = this
    const reactions = message.reactions.cache
    const messageReaction = reactions.find(r => r.emoji.name === targetEmoji)

    // don't bother proceeding if no one has reacted using the target emoji yet
    if (!messageReaction) {
      return
    }

    /*
     * Fetch the list of the users who reacted using the target emoji and
     * extract their ids. Make sure to leave out the id of the bot.
     */
    await messageReaction.users.fetch()
    messageReaction.users.cache
      .filter(user => user.id !== client.user.id)
      .forEach(user => this.reactions.add(user.id))
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

  private get collectionChange$() {
    const { collector } = this

    const collect$ = fromEvent(collector, 'collect').pipe(
      this.generateMapOperator(ReactionChangeType.COLLECT)
    )
    const remove$ = fromEvent(collector, 'remove').pipe(
      this.generateMapOperator(ReactionChangeType.REMOVE)
    )

    return merge(collect$, remove$)
  }

  private createSharedChangesObservable(): Observable<ReactionChange> {
    const { collectionChange$, reactions, end$ } = this

    return merge(NEVER, of(undefined)).pipe(
      mergeMap(() => from(this.fetchReactionsFromServer())),
      mergeMap(() => collectionChange$),
      tap(change => {
        if (change.type === ReactionChangeType.COLLECT) {
          reactions.add(change.userId)
        } else {
          reactions.delete(change.userId)
        }
      }),
      share(),
      takeUntil(end$)
    )
  }

  get changes$() {
    return this._changes$
  }

  /**
   * @see change$
   * Similar to `change$`, but the emission are snapshots of the reaction state.
   */
  get reactions$(): Observable<string[]> {
    return this.changes$.pipe(map(() => [...this.reactions]))
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
