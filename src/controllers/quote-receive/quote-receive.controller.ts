import { Controller } from '@nestjs/common'
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
import MentionUtils from 'src/utils/mention-utils.class'

@Controller()
export class QuoteReceiveController {
  constructor(
    private cmdSvc: CommandParser,
    private receiveInt: QuoteReceiveInteractor
  ) {
    this.recieved$.subscribe(this.handler.bind(this))
  }

  private get recieved$(): Observable<IReceiveHandlerParams> {
    return this.cmdSvc.getOnParseObservable<IReceiveCommandParams>().pipe(
      filter(({ command }) => command === Command.RECEIVE_QUOTE),
      // validation for the author param
      filter(({ params, message }) => {
        const { author } = params

        // the author param is optional, so if its not provided there's no need to validate it
        if (!author) {
          return true
        }

        return (
          MentionUtils.isUserMention(author) &&
          message.mentions.users.has(MentionUtils.extractUserSnowflake(author))
        )
      }),
      // transform the data into something that the handler can digest
      map(({ message, params }) => {
        const { author } = params
        return {
          message,
          authorId: author && MentionUtils.extractUserSnowflake(author),
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
    await message.react('👀')
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
