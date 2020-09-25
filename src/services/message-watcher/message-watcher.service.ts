import { Inject, Injectable } from '@nestjs/common'
import { Client, Message } from 'discord.js'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'
import { Observable, fromEvent } from 'rxjs'
import { mergeMap, map, filter, tap } from 'rxjs/operators'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

const COMMAND_REGEXP = /(\S+)\s*(.*$)\s*/

@Injectable()
export class MessageWatcherService {
  private logger: Logger

  constructor(
    private client: Client,
    private prefixRepo: CommandPrefixRepository,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'MessageWatcherService' })
  }

  get message$(): Observable<Message> {
    return fromEvent<Message>(this.client, 'message')
  }

  get prefixedMessage$(): Observable<ICommandMessage> {
    return this.message$.pipe(
      mergeMap(message =>
        this.prefixRepo
          .getGuildPrefix$(message.guild.id)
          .pipe(map(prefix => ({ prefix, message })))
      ),
      map(({ prefix: fetchedPrefix, message }) => {
        const { content } = message

        if (!COMMAND_REGEXP.test(content)) {
          return null
        }

        // exec's index 0 is just the whole string; we don't need it
        const [prefix, command] = COMMAND_REGEXP.exec(content).slice(1)
        if (prefix !== fetchedPrefix) {
          return null
        }

        return {
          message,
          prefix,
          command,
        }
      }),
      filter(message => !!message),
      tap(({ message, prefix }) => {
        const { author, guild, channel } = message
        this.logger.silly(
          `Prefix recognized [${prefix}]: ${message.content}.`,
          {
            userId: author.id,
            guildId: guild.id,
            channelid: channel.id,
          }
        )
      })
    )
  }
}

export interface ICommandMessage {
  message: Message
  command: string
  prefix: string
}
