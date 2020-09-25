import { Controller, Inject } from '@nestjs/common'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import moment = require('moment')
import { Message } from 'discord.js'
import IQuote from 'src/common/interfaces/models/quote.interface'
import { QuoteWatchInteractor } from 'src/common/classes/interactors/quote-watch-interactor.class'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Controller()
export class QuoteApproveController {
  private logger: Logger

  constructor(
    watcherSvc: ReactionsWatcherService,
    private watchInt: QuoteWatchInteractor,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'QuoteApproveController' })
    watcherSvc.success$.subscribe(({ quote, message }) => {
      this.handler(message, quote)
    })
  }

  private generateQuoteApprovalText(quote: IQuote) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const quoteLine = `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
    const acceptLine = `<@${quote.submitterId}>, your submission has been accepted.`

    return [quoteLine, acceptLine].join('\n')
  }

  async handler(message: Message, quote: IQuote) {
    this.logger.info(`Quote ${quote.quoteId} has been accepted.`)
    const { channel } = message
    await this.watchInt.approveByMessageId(message.id)
    await message.delete({ reason: 'Quote got accepted.' })
    await channel.send(this.generateQuoteApprovalText(quote))
  }
}
