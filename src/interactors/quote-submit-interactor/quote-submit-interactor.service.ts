import { Injectable } from '@nestjs/common'

import { ClientProxy } from '@nestjs/microservices'
import QuoteSubmitInteractor, {
  ISubmitQuoteInput,
} from 'src/common/classes/interactors/quote-submit-interactor.class'
import MicroserviceMessages from 'src/common/enums/microservice-messages.enum'
import { IPendingQuote } from 'src/common/classes/interactors/quote-watch-interactor.class'

@Injectable()
export class QuoteSubmitInteractorService extends QuoteSubmitInteractor {
  constructor(private msClient: ClientProxy) {
    super()
  }

  submitQuote(input: ISubmitQuoteInput): Promise<IPendingQuote> {
    return this.msClient
      .send<IPendingQuote>(MicroserviceMessages.SUBMIT_QUOTE, input)
      .toPromise()
  }
}
