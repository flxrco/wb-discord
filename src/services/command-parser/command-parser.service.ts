import { Inject, Injectable } from '@nestjs/common'
import {
  MessageWatcherService,
  ICommandMessage,
} from '../message-watcher/message-watcher.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import CommandParser, {
  Command,
} from 'src/common/classes/services/command-parser.class'
import { YARGS_PROVIDER } from './yargs.provider'
import yargs from 'yargs'

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
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
    @Inject(YARGS_PROVIDER) private yargs: yargs.Argv
  ) {
    super()
    this.logger = logger.child({ context: 'CommandParserService' })
    messageSvc.prefixedMessage$.subscribe(this.onCommand.bind(this))
  }

  private yargsOutputToCommand(argv: yargs.Arguments): Command {
    const serializedPath = argv._.join('/')

    if (!serializedPath && argv.help) {
      return Command.HELP
    }

    return YARGS_MAPPING.find(
      ({ yargsPath }) => serializedPath === yargsPath.join('/')
    ).command
  }

  private onCommand({ command, message, prefix }: ICommandMessage) {
    this.yargs.parse(command, {}, (error, argv) => {
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
        command: this.yargsOutputToCommand(argv),
        params: shallowClone,
        message,
        prefix,
      })
    })
  }
}
