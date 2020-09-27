import { Controller, Inject } from '@nestjs/common'
import moment = require('moment')
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { Message } from 'discord.js'
import IQuote from 'src/common/interfaces/models/quote.interface'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

@Controller()
export class QuoteRejectController {
  private logger: Logger
  constructor(
    watcherSvc: ReactionsWatcherService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'QuoteRejectController' })
    watcherSvc.expire$.subscribe(({ message, quote }) =>
      this.handler(message, quote)
    )
  }

  private generateQuoteApprovalText(quote: IQuote) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const quoteLine = `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
    const rejectLine = `<@${quote.submitterId}>, your submission did not reach the requirements in time is therefore rejected.`

    return [quoteLine, rejectLine].join('\n')
  }

  async handler(message: Message, quote: IQuote) {
    this.logger.info(`Quote ${quote.quoteId} has expired.`)

    await message.delete()

    // tag users on edit to make the pings silent
    const notif = await message.channel.send('🤔')
    await notif.edit(this.generateQuoteApprovalText(quote))
  }
}
