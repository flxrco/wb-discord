import IQuote, {
  IBaseQuote,
} from 'src/common/interfaces/models/quote.interface'

export default abstract class QuoteRepository {
  /**
   * Pushes a new quote into the DB.
   * @param quote
   */
  abstract createQuote(quote: IBaseQuote): Promise<IQuote>

  abstract getRandomQuote(serverId: string): Promise<IQuote>
}
