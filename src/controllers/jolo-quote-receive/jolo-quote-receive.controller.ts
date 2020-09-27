import { Controller, Inject } from '@nestjs/common'
import { Message } from 'discord.js'
import { filter, map } from 'rxjs/operators'
import QuoteReceiveInteractor, {
  IRecieveQuoteOutput,
} from 'src/common/classes/interactors/quote-receive-interactor.class'
import moment = require('moment-timezone')
import { Observable } from 'rxjs'
import CommandParser, {
  Command,
} from 'src/common/classes/services/command-parser.class'
import { AUTHOR_ID } from '../author-id.provider'

@Controller()
export class JoloQuoteReceiveController {
  constructor(
    private cmdSvc: CommandParser,
    private receiveInt: QuoteReceiveInteractor,
    @Inject(AUTHOR_ID) private authorId: string
  ) {
    this.recieved$.subscribe(this.handler.bind(this))
  }

  private get recieved$(): Observable<IJoloReceiveHandlerParams> {
    return this.cmdSvc.getOnParseObservable().pipe(
      filter(({ command }) => command === Command.RECEIVE_QUOTE),
      // transform the data into something that the handler can digest
      map(({ message }) => {
        return {
          message,
        }
      }),
      filter(data => !!data)
    )
  }

  private formatMessage({ quote }: IRecieveQuoteOutput) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    return `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
  }

  private async handler({ message }: IJoloReceiveHandlerParams) {
    await message.react('👀')
    const reply = await message.channel.send('🤔')
    const { authorId } = this

    try {
      const receive = await this.receiveInt.receiveQuote({
        channelId: message.channel.id,
        messageId: reply.id,
        receiverId: reply.author.id,
        serverId: reply.guild.id,
        authorId,
      })

      await reply.edit(this.formatMessage(receive))
    } catch (e) {
      // TODO handle no quote found
      await reply.edit('Something went wrong while processing your request.')
    }
  }
}

interface IJoloReceiveHandlerParams {
  message: Message
}
