import { Controller } from '@nestjs/common'
import moment = require('moment')
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { Message } from 'discord.js'
import IQuote from 'src/common/interfaces/models/quote.interface'

@Controller()
export class QuoteRejectController {
  constructor(watcherSvc: ReactionsWatcherService) {
    watcherSvc.expire$.subscribe(({ message, quote }) =>
      this.handler(message, quote)
    )
  }

  private generateQuoteApprovalText(quote: IQuote) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const quoteLine = `**"${quote.content}"** <@${quote.authorId}>, ${year}`
    const rejectLine = `<@${quote.submitterId}>, your submission did not reach the requirements in time is therefore rejected.`

    return [quoteLine, rejectLine].join('\n')
  }

  async handler(message: Message, quote: IQuote) {
    const { channel } = message
    await message.delete({ reason: 'Submission was rejected.' })
    await channel.send(this.generateQuoteApprovalText(quote))
  }
}
