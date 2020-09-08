import { Controller } from '@nestjs/common'
import { Message } from 'discord.js'
import moment = require('moment-timezone')
import { QuoteSubmitInteractorService } from 'src/interactors/quote-submit-interactor/quote-submit-interactor.service'
import { ISubmitQuoteOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import { GuildUtilsService } from 'src/services/guild-utils/guild-utils.service'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'

// this controller tag is just to include the class in Nest.js' dependency tree
@Controller()
export class QuoteSubmitController {
  constructor(
    private submitInt: QuoteSubmitInteractorService,
    private guildUtils: GuildUtilsService,
    private watcherSvc: ReactionsWatcherService
  ) {}

  /**
   * Generates a string which serves as the bot's response to a submission.
   * @param param0
   * @param param1
   */
  private generateSubmitQuoteSuccessReply(
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

  /**
   *
   * @param submissionMessage The message that came from the user which contains the bot command to submit.
   * @param param1 The valid extracted submission data from `submissionMessage.
   * @param replyMessage The bot's reply to the user. This is assumed to be in the same channel (and guild) as
   *    the user's `submissionMessage`.
   */
  private async submitToCoreMicroservice(
    submissionMessage: Message,
    { content, yearOverride }: ISubmissionParams,
    replyMessage: Message
  ) {
    const submitter = submissionMessage.author
    const author = submissionMessage.mentions.users.first()
    const { channel, guild } = submissionMessage

    const now = moment()
    // this does the actual call to the core microservice
    return await this.submitInt.submitQuote({
      authorId: author.id,
      submitterId: submitter.id,
      submitDt: now.toDate(),
      // for now, expiration date will always be 7 days from the submission date
      expireDt: now.add(7, 'days').toDate(),
      channelId: channel.id,
      content,
      yearOverride,
      messageId: replyMessage.id,
      serverId: guild.id,
    })
  }

  /**
   * This function pretty much handles the business logic for quote submission. This function already
   * assumes that the data received is already validated.
   *
   * @param submission  The message which contains the bot command for submission.
   * @param submissionParams The parsed parameters of the command.
   */
  async submitQuote(
    submission: Message,
    submissionParams: ISubmissionParams
  ): Promise<void> {
    // send the initial reply -- this indicates that the bot is loading
    const reply = await submission.channel.send('🤔')

    try {
      // perist the quote to the core microservice
      const submitted = await this.submitToCoreMicroservice(
        submission,
        submissionParams,
        reply
      )

      // this will be fed to the reply and the watcher for the message
      const emojiReqs = {
        emoji: await this.guildUtils.getEmoji(
          '🤔',
          'name',
          submission.guild.id
        ),
        amount: 7,
      }

      // send the reply to the user that acknowledges that the quote has been received by the server
      await reply.edit(
        this.generateSubmitQuoteSuccessReply(submitted, emojiReqs)
      )

      /*
       * our last reply was meant to be given reactions. these reactions serves as the
       * voting system. once a certain amount has reached, the quote will get accepted
       * and it will be included in the pool of quotes which can be retrieved by calling
       * the bot's receive function.
       */
      this.watcherSvc.watchSubmission(submitted, submission, emojiReqs)
    } catch (e) {
      // we're not really expecting this one
      await reply.edit(
        'An unexpected error occurred while submitting your quote'
      )
    }
  }
}

interface ISubmissionParams {
  content: string
  yearOverride?: number
}
