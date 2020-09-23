import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import {
  GroupedObservable,
  Observable,
  of,
  race,
  Subject,
  throwError,
  timer,
} from 'rxjs'
import {
  concatMap,
  delay,
  filter,
  finalize,
  groupBy,
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs/operators'
import { Logger } from 'winston'
import { v4 as uuid } from 'uuid'

const TASK_TIMEOUT = 1000 * 60 * 1

@Injectable()
export class ExecutorService implements OnApplicationBootstrap {
  private readonly logger: Logger

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    this.logger = logger.child({ context: 'ExecutorService' })
  }

  private todo$ = new Subject<ITask>()
  private doing$ = new Subject<ITask>()
  private done$ = new Subject<ITask>()
  private timeout$ = new Subject<ITask>()

  onApplicationBootstrap() {
    this.initScheduler()
  }

  /**
   *
   */
  private initScheduler() {
    const { todo$ } = this

    todo$
      .pipe(
        groupBy(({ groupId }) => groupId),
        mergeMap(this.processGroup.bind(this))
      )
      .subscribe()
  }

  /**
   *
   * @param group$
   */
  private processGroup(group$: GroupedObservable<string, ITask>) {
    const { doing$, done$, timeout$ } = this

    return group$.pipe(
      delay(100),
      concatMap(todo => {
        // emit the task in the doing subject to let the task know to start running
        doing$.next(todo)

        return race(
          // the task observable is expected to emit the task in the done subject upon completion
          done$.pipe(filter(done => done.processId === todo.processId)),
          // if the task is not yet done within the set number of time, it will be emitted as a timeout to halt it
          timer(TASK_TIMEOUT).pipe(tap(() => timeout$.next(todo)))
        ).pipe(take(1))
      })
    )
  }

  /**
   *
   * @param groupId
   * @param toExecute
   */
  executeAsyncFunction<T>(groupId: string, toExecute: () => Promise<T>) {
    const obs$ = new Observable<T>(obs => {
      toExecute()
        .then(data => {
          obs.next(data)
          obs.complete()
        })
        .catch(e => obs.error(e))
    })

    return this.executeObservable(groupId, obs$)
  }

  /**
   *
   * @param groupId
   * @param toExecute$
   */
  executeObservable<T>(groupId: string, toExecute$: Observable<T>) {
    const { todo$, doing$, done$, timeout$, logger } = this

    return of(undefined).pipe(
      // upon subscribing, create a unique process id for this
      map(() => {
        return {
          groupId,
          processId: uuid(),
        } as ITask
      }),
      tap(task => {
        // emit the unique task into the queue
        todo$.next(task)
        logger.debug(`[${task.groupId}] Queued ${task.processId}`)
      }),
      /*
       * This mergeMap will only emit if the task was emitted in doing$ which
       * signifies that the process should execute.
       */
      mergeMap(task =>
        doing$.pipe(filter(({ processId }) => processId === task.processId))
      ),
      tap(task => {
        logger.debug(
          `[${task.groupId}] Received go signal for ${task.processId}`
        )
      }),
      mergeMap(task => {
        return race(
          toExecute$.pipe(
            // will finalize on success or if an error was thrown
            finalize(() => {
              done$.next(task)
              logger.debug(`[${task.groupId}] Finished ${task.processId}`)
            })
          ),
          // the process must complete before the timeout or else it will be cancelled
          timeout$.pipe(
            filter(timeout => timeout.processId === task.processId),
            tap(task => {
              logger.debug(
                `[${task.groupId}] Timeout reached for ${task.processId}`
              )
            }),
            // an error will be thrown if the task appears in the timeout emitter
            mergeMap(() => throwError(new Error('TIMEOUT')))
          )
        )
      }),
      take(1)
    )
  }
}

interface ITask {
  groupId: string
  processId: string
}
