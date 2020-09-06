import {
  ReactionCollector,
  Message,
  Snowflake,
  MessageReaction,
  User,
  ReactionCollectorOptions,
} from 'discord.js'
import { fromEvent, of, never, Observable, merge } from 'rxjs'
import { takeUntil, map, mapTo } from 'rxjs/operators'

export default class MessageReactionWrapper {
  /**
   * Given a message, a new reaction collector is spawned off it and that same reaction collector
   * is then wrapped around with RxJS functionalities.
   *
   * This is similar to @see Message#createReactionCollector.
   *
   * @param message
   * @param filter
   * @param options
   */
  static wrap(
    message: Message,
    filter: MessageCollectionFilter = () => true,
    options?: ReactionCollectorOptions
  ): MessageReactionWrapper {
    return new MessageReactionWrapper(message, filter, options)
  }

  private collector: ReactionCollector

  private constructor(
    private message: Message,
    filter: MessageCollectionFilter = () => true,
    options?: ReactionCollectorOptions
  ) {
    this.collector = message.createReactionCollector(filter, options)
  }

  private get reactionCache() {
    return this.message.reactions.cache
  }

  /**
   * @returns {ReactionMap} A snapshot of the number of reactions per emoji id. Each call will
   *    generate a different reference of the map.
   */
  get reactions(): ReactionMap {
    const reactions = [...this.reactionCache.values()]
    return reactions.reduce((map, r) => {
      map[r.emoji.id] = r.users.cache.keyArray()
      return map
    }, {})
  }

  /**
   * @returns {Observable<void>} Emits and completes once the wrapper's internal collector
   *    has ended. If it's already ended,  the emission and completion will happen upon subscription.
   */
  get end$() {
    const { collector } = this
    if (collector.ended) {
      return of(null).pipe(mapTo(undefined))
    }
    return fromEvent(collector, 'end').pipe(mapTo(undefined))
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

  private changeMapOp(type: ReactionChangeType) {
    return map<MessageReaction, ReactionChange>((r: MessageReaction) => {
      return {
        type,
        emojiId: r.emoji.id,
        userId: r.users.cache.first().id,
      }
    })
  }

  /**
   * @returns {Observable<ReactionChange>} Emits when a user added or removed a reaction from the
   *    message we're watching. The emission data will be about who did the reaction/removal and which
   *    emoji was it.
   */
  get change$(): Observable<ReactionChange> {
    const { collector } = this

    const collect$ = fromEvent(collector, 'collect').pipe(
      this.changeMapOp(ReactionChangeType.COLLECT)
    )
    const remove$ = fromEvent<MessageReaction>(collector, 'remove').pipe(
      this.changeMapOp(ReactionChangeType.REMOVE)
    )

    return merge(collect$, remove$).pipe(takeUntil(this.end$))
  }

  /**
   * @see change$
   * @returns {Observable<ReactionMap>} Similar to `change$`, but the emission are snapshots
   *    of the reaction state.
   */
  get reactions$(): Observable<ReactionMap> {
    const { collector } = this
    if (collector.ended) {
      return never()
    }

    return merge(
      fromEvent(collector, 'remove'),
      fromEvent(collector, 'collect')
    ).pipe(
      takeUntil(this.end$),
      map(() => this.reactions)
    )
  }
}

export interface ReactionMap {
  [key: string]: string[]
}

export enum ReactionChangeType {
  COLLECT,
  REMOVE,
}

export interface ReactionChange {
  userId: Snowflake
  emojiId: Snowflake
  type: ReactionChangeType
}

export type MessageCollectionFilter = (r: MessageReaction, u: User) => boolean
