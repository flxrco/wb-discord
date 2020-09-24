import { Observable } from 'rxjs'
import { ExecutorService } from './executor.service'

export default class SubExecutor {
  constructor(private executor: ExecutorService, private _groupId: string) {}

  get groupId(): string {
    return this._groupId
  }

  execute<T>(toExecute: () => Promise<T>) {
    return this.executor.execute(this.groupId, toExecute)
  }

  execute$<T>(toExecute: () => Promise<T>) {
    return this.executor.execute$(this.groupId, toExecute)
  }

  executeObservable<T>(toExecute$: Observable<T>) {
    return this.executor.executeObservable(this.groupId, toExecute$)
  }

  executeObservable$<T>(toExecute$: Observable<T>) {
    return this.executor.executeObservable$(this.groupId, toExecute$)
  }
}
