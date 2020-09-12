import { Controller } from '@nestjs/common'
import { Message } from 'discord.js'
import moment = require('moment-timezone')
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { CommandParserService } from 'src/services/command-parser/command-parser.service'
import { isDeepStrictEqual } from 'util'
import { filter, map } from 'rxjs/operators'
import ApprovalRequirementsRepository from 'src/common/classes/repositories/approval-requirements-repository.class'
import { IPendingQuote } from 'src/common/classes/interactors/quote-watch-interactor.class'
import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'
import QuoteSubmitInteractor from 'src/common/classes/interactors/quote-submit-interactor.class'

// this controller tag is just to include the class in Nest.js' dependency tree
@Controller()
export class QuoteSubmitController {
  constructor(
    private submitInt: QuoteSubmitInteractor,
    private watcherSvc: ReactionsWatcherService,
    private parserSvc: CommandParserService,
    private reqRepo: ApprovalRequirementsRepository
  ) {
    this.submitted$.subscribe(this.handler.bind(this))
  }

  static readonly USER_MENTION_PATTERN = /^<@!?(\d{17,19})>$/

  private get submitted$() {
    return this.parserSvc.getOnParseObservable<ISubmitCommandParams>().pipe(
      filter(
        ({ commands }) =>
          isDeepStrictEqual(commands, ['submit']) ||
          isDeepStrictEqual(commands, ['add'])
      ),
      filter(({ message, params }) => {
        if (!QuoteSubmitController.USER_MENTION_PATTERN.test(params.author)) {
          return false
        }

        const snowflake = QuoteSubmitController.USER_MENTION_PATTERN.exec(
          params.author
        )[1]

        return message.mentions.users.has(snowflake)
      }),
      map(
        ({ message, params }) =>
          ({
            message,
            content: params.content,
            yearOverride: params.year,
          } as ISubmitHandlerParams)
      )
    )
  }

  /**
   * Generates a string which serves as the bot's response to a submission.
   * @param param0
   * @param param1
   */
  private generateSubmitQuoteSuccessReply({
    quote,
    submissionStatus,
  }: IPendingQuote) {
    const { count, emoji } = submissionStatus.requirements

    const year = quote.yearOverride || moment(quote.submitDt).get('year')
    const expireDt = moment(submissionStatus.expireDt).format(
      'MMMM D, YYYY h:mm:ss a'
    )

    const quoteLine = `**"${quote.content}"** <@${quote.authorId}>, ${year}`
    const instructionsLine = `_This submission needs ${count} ${emoji} to get reactions on or before *${expireDt}*._`

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
    { content, yearOverride, message, requirements }: ISubmitHandlerParams,
    replyMessage: Message
  ) {
    const submitter = message.author
    const author = message.mentions.users.first()
    const { channel, guild } = message

    const now = moment()
    // this does the actual call to the core microservice
    return await this.submitInt.submitQuote({
      authorId: author.id,
      submitterId: submitter.id,
      submitDt: now.toDate(),
      // for now, expiration date will always be 7 days from the submission date
      expireDt: now.add(7, 'days').toDate(),
      channelId: channel.id,
      messageId: replyMessage.id,
      serverId: guild.id,

      ...requirements,

      content,
      yearOverride,
    })
  }

  /**
   * This function pretty much handles the business logic for quote submission. This function already
   * assumes that the data received is already validated.
   *
   * @param submission  The message which contains the bot command for submission.
   * @param submissionParams The parsed parameters of the command.
   */
  async handler(params: ISubmitHandlerParams): Promise<void> {
    const { message } = params
    // send the initial reply -- this indicates that the bot is loading
    const reply = await message.channel.send('🤔')

    // fetch the requiremetns for that server
    const emojiReqs = await this.reqRepo.getRequirements(
      message.guild.id,
      message.channel.id
    )

    try {
      // perist the quote to the core microservice
      const submitted = await this.submitToCoreMicroservice(
        {
          ...params,
          requirements: emojiReqs,
        },
        reply
      )

      console.debug(submitted)

      // send the reply to the user that acknowledges that the quote has been received by the server
      await reply.edit(this.generateSubmitQuoteSuccessReply(submitted))

      await reply.react(emojiReqs.emoji)

      /*
       * our last reply was meant to be given reactions. these reactions serves as the
       * voting system. once a certain amount has reached, the quote will get accepted
       * and it will be included in the pool of quotes which can be retrieved by calling
       * the bot's receive function.
       */
      this.watcherSvc.watchSubmission(submitted, reply)
    } catch (e) {
      console.debug(e)
      // we're not really expecting this one
      await reply.edit(
        'An unexpected error occurred while submitting your quote'
      )
    }
  }
}

interface ISubmitHandlerParams {
  content: string
  yearOverride?: number
  message: Message
  requirements: IApprovalRequirements
}

interface ISubmitCommandParams {
  content: string
  year?: number
  author: string
}
