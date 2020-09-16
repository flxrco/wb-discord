import { Controller } from '@nestjs/common'
import { Message } from 'discord.js'
import { filter, map } from 'rxjs/operators'
import QuoteReceiveInteractor, {
  IRecieveQuoteOutput,
} from 'src/common/classes/interactors/quote-receive-interactor.class'
import { CommandParserService } from 'src/services/command-parser/command-parser.service'
import { isDeepStrictEqual } from 'util'
import moment = require('moment-timezone')

@Controller()
export class QuoteReceiveController {
  constructor(
    private cmdSvc: CommandParserService,
    private receiveInt: QuoteReceiveInteractor
  ) {
    this.recieved$.subscribe(this.handler.bind(this))
  }

  private get recieved$() {
    return this.cmdSvc.parsed$.pipe(
      filter(({ commands }) => isDeepStrictEqual(commands, ['receive'])),
      // TODO handle the user parameter
      map(({ message }) => message)
    )
  }

  private formatMessage({ quote }: IRecieveQuoteOutput) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    return `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
  }

  private async handler(message: Message) {
    const reply = await message.channel.send('🤔')
    try {
      const receive = await this.receiveInt.receiveQuote({
        channelId: message.channel.id,
        messageId: reply.id,
        receiverId: reply.author.id,
        serverId: reply.guild.id,
      })

      await reply.edit(this.formatMessage(receive))
    } catch (e) {
      await reply.edit('Something went wrong while processing your request.')
    }
  }
}
