import { Controller } from '@nestjs/common'
import { Message } from 'discord.js'
import { filter, map } from 'rxjs/operators'
import QuoteReceiveInteractor, {
  IRecieveQuoteOutput,
} from 'src/common/classes/interactors/quote-receive-interactor.class'
import { CommandParserService } from 'src/services/command-parser/command-parser.service'
import { isDeepStrictEqual } from 'util'
import moment = require('moment-timezone')
import { Observable } from 'rxjs'

@Controller()
export class QuoteReceiveController {
  constructor(
    private cmdSvc: CommandParserService,
    private receiveInt: QuoteReceiveInteractor
  ) {
    this.recieved$.subscribe(this.handler.bind(this))
  }

  static readonly USER_MENTION_PATTERN = /^<@!?(\d{17,19})>$/

  private get recieved$(): Observable<IReceiveHandlerParams> {
    return this.cmdSvc.getOnParseObservable<IReceiveCommandParams>().pipe(
      filter(({ commands }) => isDeepStrictEqual(commands, ['receive'])),
      map(({ message, params }) => {
        // if the optional author param was not filled up, no need for additional handling
        if (!params.author) {
          return { message }
        }

        const regexp = QuoteReceiveController.USER_MENTION_PATTERN

        if (!regexp.test(params.author)) {
          return null
        }

        const [snowflake] = regexp.exec(params.author).slice(1)
        if (!message.mentions.users.has(snowflake)) {
          return null
        }

        return {
          message,
          authorId: snowflake,
        }
      }),
      filter(data => !!data)
    )
  }

  private formatMessage({ quote }: IRecieveQuoteOutput) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    return `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
  }

  private async handler({ message, authorId }: IReceiveHandlerParams) {
    const reply = await message.channel.send('🤔')

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

interface IReceiveCommandParams {
  author?: string
}

interface IReceiveHandlerParams {
  authorId?: string
  message: Message
}
