import { Injectable } from '@nestjs/common'
import { Client, Message } from 'discord.js'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'
import { Observable, fromEvent } from 'rxjs'
import { mergeMap, map, filter } from 'rxjs/operators'

const COMMAND_REGEXP = /(\S+)\s*(.*$)/

@Injectable()
export class MessageWatcherService {
  constructor(
    private client: Client,
    private prefixRepo: CommandPrefixRepository
  ) {}

  get message$(): Observable<Message> {
    return fromEvent<Message>(this.client, 'message')
  }

  get command$(): Observable<ICommandMessage> {
    return this.message$.pipe(
      mergeMap(message => {
        return this.prefixRepo.getGuildPrefix$(message.guild.id).pipe(
          map(guildPrefix => {
            const { content } = message

            if (!COMMAND_REGEXP.test(content)) {
              return null
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [source, prefix, command] = COMMAND_REGEXP.exec(content)
            if (prefix !== guildPrefix) {
              return null
            }

            return {
              message,
              prefix,
              command,
            }
          })
        )
      }),
      filter(message => !!message)
    )
  }
}

export interface ICommandMessage {
  message: Message
  command: string
  prefix: string
}
