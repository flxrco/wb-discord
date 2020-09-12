import { IBaseQuote } from 'src/common/interfaces/models/quote.interface'
import { IPendingQuote } from './quote-watch-interactor.class'
import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'

export default abstract class QuoteSubmitInteractor {
  abstract submitQuote(input: ISubmitQuoteInput): Promise<IPendingQuote>
}

export interface ISubmitQuoteInput extends IBaseQuote, IApprovalRequirements {
  serverId: string
  messageId: string
  channelId: string
  expireDt: Date
}
