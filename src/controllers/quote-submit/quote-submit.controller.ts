import { Controller, Inject } from '@nestjs/common'
import { Message } from 'discord.js'
import moment = require('moment-timezone')
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { filter, map } from 'rxjs/operators'
import ApprovalRequirementsRepository from 'src/common/classes/repositories/approval-requirements-repository.class'
import { IPendingQuote } from 'src/common/classes/interactors/quote-watch-interactor.class'
import QuoteSubmitInteractor from 'src/common/classes/interactors/quote-submit-interactor.class'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import CommandParser, {
  Command,
} from 'src/common/classes/services/command-parser.class'
import MentionUtils from 'src/utils/mention-utils.class'
import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'

// this controller tag is just to include the class in Nest.js' dependency tree
@Controller()
export class QuoteSubmitController {
  private logger: Logger

  constructor(
    private submitInt: QuoteSubmitInteractor,
    private watcherSvc: ReactionsWatcherService,
    private parserSvc: CommandParser,
    private reqRepo: ApprovalRequirementsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger
  ) {
    this.logger = logger.child({ context: 'QuoteSubmitController' })
    this.submitted$.subscribe(this.handler.bind(this))
  }

  /**
   * Listens for quote submission commands from the command event bus and
   * maps it to a format consumable by the handler.
   */
  private get submitted$() {
    return this.parserSvc.getOnParseObservable<ISubmitCommandParams>().pipe(
      filter(({ command }) => command === Command.SUBMIT_QUOTE),
      // check if the content has no user mentions in it
      filter(({ params }) => !MentionUtils.hasUserMention(params.content)),
      // check if the author section is an actual discord mention
      filter(
        ({ params, message }) =>
          MentionUtils.isUserMention(params.author) &&
          message.mentions.users.has(
            MentionUtils.extractUserSnowflake(params.author)
          )
      ),
      // finally, transform the input for consumption of the handler
      map(({ message, params }) => {
        const { content, author, year } = params
        return {
          content,
          message,
          authorId: MentionUtils.extractUserSnowflake(author),
          yearOverride: year,
        } as ISubmitHandlerParams
      })
    )
  }

  private async fetchSubmissionRequirements({ message }: ISubmitHandlerParams) {
    return this.reqRepo.getRequirements(message.guild.id, message.channel.id)
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

    const quoteLine = `**"${quote.content}"** - <@${quote.authorId}>, ${year}`
    const instructionsLine = `_This submission needs ${count} ${emoji} reacts to get reactions on or before *${expireDt}*._`

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
    { content, yearOverride, message }: ISubmitHandlerParams,
    requirements: IApprovalRequirements,
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
    await params.message.react('👀')
    const { message } = params
    // send the initial reply -- this indicates that the bot is loading
    const reply = await message.channel.send('🤔')

    // fetch the requirements for that server
    const emojiReqs = await this.fetchSubmissionRequirements(params)

    try {
      // perist the quote to the core microservice
      const submitted = await this.submitToCoreMicroservice(
        params,
        emojiReqs,
        reply
      )

      // send the reply to the user that acknowledges that the quote has been received by the server
      await reply.edit(this.generateSubmitQuoteSuccessReply(submitted))
      // react with the requried emoji so the users can just click on it
      await reply.react(emojiReqs.emoji)

      /*
       * our last reply was meant to be given reactions. these reactions serves as the
       * voting system. once a certain amount has reached, the quote will get accepted
       * and it will be included in the pool of quotes which can be retrieved by calling
       * the bot's receive function.
       */
      this.watcherSvc.watchSubmission(submitted, reply)
      this.logger.info(
        `${message.author.id} submitted a quote in channel ${message.channel.id} of guild ${message.guild.id}.`
      )
    } catch (e) {
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
  authorId: string
}

interface ISubmitCommandParams {
  content: string
  year?: number
  author: string
}
