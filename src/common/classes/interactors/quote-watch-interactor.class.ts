import IQuote from 'src/common/interfaces/models/quote.interface'
import ISubmissionStatus from 'src/common/interfaces/models/submission-status.interface'

export abstract class QuoteWatchInteractor {
  /**
   * Finds a pending quote associated with the `messageId` and approves it.
   * If the quote is already approved, then an error is thrown. An error is also
   * thrown if there are no associated messages found.
   * @param messageId
   */
  abstract approveByMessageId(messageId: string): Promise<IPendingQuote>

  /**
   *
   * @param serverId
   */
  abstract getPendingQuotes(serverId: string): Promise<IPendingQuote[]>

  /**
   *
   * @param messageId
   */
  abstract flagAsLost(messageId: string): Promise<IPendingQuote>
}

export interface IPendingQuote {
  quote: IQuote
  submissionStatus: ISubmissionStatus
}
