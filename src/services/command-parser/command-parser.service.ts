import { Injectable } from '@nestjs/common'
import {
  MessageWatcherService,
  ICommandMessage,
} from '../message-watcher/message-watcher.service'
import yargs = require('yargs')
import { Subject, Observable } from 'rxjs'
import { Message } from 'discord.js'

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
  constructor(messageSvc: MessageWatcherService) {
    messageSvc.prefixedMessage$.subscribe(this.onCommand.bind(this))
  }

  private eventBus = new Subject<IParseResults>()

  private onCommand({ command, message }: ICommandMessage) {
    YARGS_INSTANCE.parse(command, {}, (err, argv) => {
      if (err) {
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

  getOnParseObservable<T>() {
    return this.parsed$ as Observable<IParseResults<T>>
  }
}

export interface IParseResults<T = any> {
  commands: string[]
  params: T
  message: Message
}
