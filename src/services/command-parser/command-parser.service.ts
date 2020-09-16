import { Inject, Injectable } from '@nestjs/common'
import {
  MessageWatcherService,
  ICommandMessage,
} from '../message-watcher/message-watcher.service'
import yargs = require('yargs')
import { Subject, Observable } from 'rxjs'
import { Message } from 'discord.js'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

// TODO stick this up in a provider or something, jesus
const YARGS_INSTANCE = yargs
  .command(
    ['submit <content> <author> [year]', 'add'],
    'Submit a quote for approval.',
    yargs => {
      yargs
        .positional('content', { describe: 'The content of the quote.' })
        .positional('author', {
          describe:
            'The author of the quote. Can be a mention (e.g. @Wisdom) or a plain string (e.g. "Socrates").',
        })
        .positional('year', {
          describe:
            'Overrides the year of the quote. If no value was provided, the quote year will be the current year.',
          type: 'number',
        })
        .help()
    }
  )
  .command(
    'receive [author]',
    'Fetches a random quote from the database.',
    yargs => {
      yargs
        .positional('author', {
          description:
            'Must be a mention to a user. If a value was provided, then the quote to be received will be filtered to the ones from the author.',
        })
        .help()
    }
  )
  .help()
  .wrap(null)
  .version(false)
  .strict(true)

@Injectable()
export class CommandParserService {
  private logger: Logger

  constructor(
    messageSvc: MessageWatcherService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'CommandParserService' })
    messageSvc.prefixedMessage$.subscribe(this.onCommand.bind(this))
  }

  // successful parses
  private eventBus = new Subject<IParseResults>()
  // erroneous parses
  private errorBus = new Subject<IParseError>()

  private onCommand({ command, message }: ICommandMessage) {
    YARGS_INSTANCE.parse(command, {}, (error, argv) => {
      if (error) {
        this.errorBus.next({
          error,
          message,
        })
        return
      }

      const shallowClone = { ...argv }
      delete shallowClone._
      delete shallowClone.$0

      const parsed: IParseResults = {
        commands: argv._,
        params: shallowClone,
        message,
      }

      this.eventBus.next(parsed)
    })
  }

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
  commands: string[]
  params: T
  message: Message
}

export interface IParseError {
  error: Error
  message: Message
}
