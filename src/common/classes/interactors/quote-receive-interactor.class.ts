import IQuote from 'src/common/interfaces/models/quote.interface'
import IReceive from 'src/common/interfaces/models/receive.interface'

export default abstract class QuoteReceiveInteractor {
  abstract receiveQuote(input: IReceiveQuoteInput): Promise<IRecieveQuoteOutput>
}

export interface IReceiveQuoteInput {
  serverId: string
  channelId: string
  messageId: string
  receiverId: string
}

export interface IRecieveQuoteOutput {
  quote: IQuote
  receive: IReceive
}
