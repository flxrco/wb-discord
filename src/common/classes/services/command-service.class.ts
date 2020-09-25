import { Message } from 'discord.js'
import { Observable, Subject } from 'rxjs'

export default abstract class CommandService {
  // successful parses
  protected eventBus = new Subject<IParseResults>()
  // erroneous parses
  protected errorBus = new Subject<IParseError>()

  get parsed$() {
    return this.eventBus.asObservable()
  }

  get error$() {
    return this.errorBus.asObservable()
  }

  getOnParseObservable<T>() {
    return this.parsed$ as Observable<IParseResults<T>>
  }
}

export interface IParseResults<T = any> {
  command: Command
  params: T
  message: Message
}

export interface IParseError {
  error: Error
  message: Message
}

export enum Command {
  SUBMIT_QUOTE,
  RECEIVE_QUOTE,
}
