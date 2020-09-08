import { Controller } from '@nestjs/common'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { QuoteSubmitInteractorService } from 'src/interactors/quote-submit-interactor/quote-submit-interactor.service'
import moment = require('moment')
import IQuote from 'src/common/core/interfaces/models/quote.interface'
import { Message } from 'discord.js'

@Controller()
export class QuoteApproveController {
  constructor(
    private watcherSvc: ReactionsWatcherService,
    private submitInt: QuoteSubmitInteractorService
  ) {
    this.watcherSvc.success$.subscribe(({ quote, message }) => {
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
    await this.submitInt.approveQuote(message.id)
    await message.delete({ reason: 'Quote got accepted.' })
    await channel.send(this.generateQuoteApprovalText(quote))
  }
}
