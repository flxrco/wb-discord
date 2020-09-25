import { Inject, Injectable } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import CommandParser, {
  Command,
} from 'src/common/classes/services/command-parser.class'
import { Logger } from 'winston'
import {
  ICommandMessage,
  MessageWatcherService,
} from '../message-watcher/message-watcher.service'

const RegexpMap = {
  SUBMIT: /^add\s+(.+)\s*$/,
  RECEIVE: /^receive\s*$/,
}

const JOLO_ID = '169744487474528256'

@Injectable()
export class JoloCommandParserService extends CommandParser {
  private logger: Logger

  constructor(
    messageSvc: MessageWatcherService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    super()
    this.logger = logger.child({ context: 'JoloCommandParserService' })
    this.logger.debug('Started the Jolo parser.')
    messageSvc.prefixedMessage$.subscribe(this.onCommand.bind(this))
  }

  private onCommand({ command, message }: ICommandMessage) {
    if (RegexpMap.SUBMIT.test(command)) {
      this.logger.debug('Submit command recognized.')
      const content = RegexpMap.SUBMIT.exec(command)[1]
      this.eventBus.next({
        command: Command.SUBMIT_QUOTE,
        message,
        params: {
          author: JOLO_ID,
          content,
        },
      })
    } else if (RegexpMap.RECEIVE.test(command)) {
      this.logger.debug('Receive command recognized.')
      this.eventBus.next({
        command: Command.RECEIVE_QUOTE,
        message,
        params: {
          author: JOLO_ID,
        },
      })
    } else {
      this.logger.debug('No applicable commands recognized.')
      // noop
    }
  }
}
