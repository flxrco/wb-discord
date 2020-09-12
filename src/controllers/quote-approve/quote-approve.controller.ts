import { Controller } from '@nestjs/common'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import moment = require('moment')
import { Message } from 'discord.js'
import IQuote from 'src/common/interfaces/models/quote.interface'
import { QuoteWatchInteractor } from 'src/common/classes/interactors/quote-watch-interactor.class'

@Controller()
export class QuoteApproveController {
  constructor(
    watcherSvc: ReactionsWatcherService,
    private watchInt: QuoteWatchInteractor
  ) {
    watcherSvc.success$.subscribe(({ quote, message }) => {
      this.handler(message, quote)
    })
  }

  private generateQuoteApprovalText(quote: IQuote) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const quoteLine = `**"${quote.content}"** <@${quote.authorId}>, ${year}`
    const acceptLine = `<@${quote.submitterId}>, your submission has been accepted.`

    return [quoteLine, acceptLine].join('\n')
  }

  async handler(message: Message, quote: IQuote) {
    const { channel } = message
    await this.watchInt.approveByMessageId(message.id)
    await message.delete({ reason: 'Quote got accepted.' })
    await channel.send(this.generateQuoteApprovalText(quote))
  }
}
