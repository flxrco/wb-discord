import { Inject, Injectable } from '@nestjs/common'
import {
  MessageWatcherService,
  ICommandMessage,
} from '../message-watcher/message-watcher.service'
import yargs = require('yargs')
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import CommandParser, {
  Command,
} from 'src/common/classes/services/command-parser.class'

import { isDeepStrictEqual } from 'util'

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

interface YargsMapping {
  command: Command
  yargsPath: string[]
}

const YARGS_MAPPING: YargsMapping[] = [
  {
    command: Command.RECEIVE_QUOTE,
    yargsPath: ['receive'],
  },
  {
    command: Command.SUBMIT_QUOTE,
    yargsPath: ['add'],
  },
  {
    command: Command.SUBMIT_QUOTE,
    yargsPath: ['submit'],
  },
]

@Injectable()
export class CommandParserService extends CommandParser {
  private logger: Logger

  constructor(
    messageSvc: MessageWatcherService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    super()
    this.logger = logger.child({ context: 'CommandParserService' })
    messageSvc.prefixedMessage$.subscribe(this.onCommand.bind(this))
  }

  private yargsPathToCommand(argv: yargs.Arguments): Command {
    const path = argv._

    return YARGS_MAPPING.find(({ yargsPath }) =>
      isDeepStrictEqual(path, yargsPath)
    ).command
  }

  private onCommand({ command, message }: ICommandMessage) {
    YARGS_INSTANCE.parse(command, {}, (error, argv) => {
      if (error) {
        this.errorBus.next({
          error,
          message,
        })
        return
      }

      // extract the command params
      const shallowClone = { ...argv }
      delete shallowClone._
      delete shallowClone.$0

      this.eventBus.next({
        command: this.yargsPathToCommand(argv),
        params: shallowClone,
        message,
      })
    })
  }
}
