import IQuote from 'src/common/interfaces/models/quote.interface'
import IApprovalStatus from 'src/common/interfaces/models/approval-status.interface'

export default abstract class QuoteRepository {
  /**
   * Retrieves a quote from the DB that matches the given `quoteId`.
   * @param quoteId
   */
  abstract getQuoteById(quoteId: string): Promise<IQuote>

  /**
   * Retieves a quote form the DB that matches the given `messageId`,
   * which is found on the quote's approval status.
   * @param messageId
   */
  abstract getQuoteByMessageId(messageId: string): Promise<IQuote>

  /**
   * Gets the approval status of a quote.
   * @param quoteId
   */
  abstract getQuoteApprovalStatus(quoteId: string): Promise<IApprovalStatus>

  /**
   * Pushes a new quote into the DB.
   * @param quote
   */
  abstract createQuote(quote: IQuote): Promise<IQuote>

  /**
   * Sets the approval status of a given quote.
   * @param quoteId
   * @param approvalStatus
   */
  abstract setQuoteApprovalStatus(
    quoteId: string,
    approvalStatus: IApprovalStatus
  ): Promise<IApprovalStatus>

  /**
   * Gets the pending quotes from the database.
   * @param serverId
   */
  abstract getPendingQuotes(serverId: string): Promise<IPendingQuote[]>

  abstract getRandomQuote(serverId: string): Promise<IQuote>
}

interface IPendingQuote {
  quote: IQuote
  approvalStatus: IApprovalStatus
}
