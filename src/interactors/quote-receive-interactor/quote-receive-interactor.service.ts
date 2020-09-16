import { Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import QuoteReceiveInteractor, {
  IReceiveQuoteInput,
  IRecieveQuoteOutput,
} from 'src/common/classes/interactors/quote-receive-interactor.class'
import MicroserviceMessages from 'src/common/enums/microservice-messages.enum'

@Injectable()
export class QuoteReceiveInteractorService extends QuoteReceiveInteractor {
  constructor(private client: ClientProxy) {
    super()
  }

  receiveQuote(input: IReceiveQuoteInput): Promise<IRecieveQuoteOutput> {
    return this.client
      .send(MicroserviceMessages.RECEIVE_QUOTE, input)
      .toPromise()
  }
}
