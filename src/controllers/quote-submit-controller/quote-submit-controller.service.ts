import { Injectable } from '@nestjs/common'
import { Message } from 'discord.js'
import moment = require('moment-timezone')
import { QuoteSubmitInteractorService } from 'src/interactors/quote-submit-interactor/quote-submit-interactor.service'
import { ISubmitQuoteOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import { GuildUtilsService } from 'src/services/guild-utils/guild-utils.service'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'

@Injectable()
export class QuoteSubmitControllerService {
  constructor(
    private submitInt: QuoteSubmitInteractorService,
    private guildUtils: GuildUtilsService,
    private watcherSvc: ReactionsWatcherService
  ) {}

  private get loadingMessage() {
    return '🤔'
  }

  generateSubmitQuoteSuccessReply(
    { quote, approvalStatus }: ISubmitQuoteOutput,
    { emoji, amount }: IEmojiRequirements
  ) {
    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const expireDt = moment(approvalStatus.expireDt).format(
      'MMMM D, YYYY h:mm:ss a'
    )

    const quoteLine = `**"${quote.content}"** <@${quote.authorId}>, ${year}`
    const instructionsLine = `_This submission needs ${amount} ${emoji} to get reactions on or before *${expireDt}*._`

    return [quoteLine, instructionsLine].join('\n')
  }

  async submitQuote(
    message: Message,
    { content, yearOverride }: IQuoteData
  ): Promise<Message> {
    const { id: submitterId } = message.author
    const { id: authorId } = message.mentions.users.first()
    const { channel, guild } = message

    const reply = await channel.send(this.loadingMessage)

    try {
      const now = moment()
      const submitted = await this.submitInt.submitQuote({
        authorId,
        submitterId,
        submitDt: now.toDate(),
        expireDt: now.add(7, 'days').toDate(),
        channelId: channel.id,
        content,
        yearOverride,
        messageId: reply.id,
        serverId: guild.id,
      })

      const emojiReqs = {
        emoji: await this.guildUtils.getEmoji('🤔', 'name', guild.id),
        amount: 7,
      }

      await reply.edit(
        this.generateSubmitQuoteSuccessReply(submitted, emojiReqs)
      )

      this.watcherSvc.watchSubmission(submitted, message, emojiReqs)
    } catch (e) {
      await reply.edit(
        'An unexpected error occurred while submitting your quote'
      )
    }

    return reply
  }
}

interface IQuoteData {
  content: string
  yearOverride?: number
}
