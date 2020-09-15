import { Injectable } from '@nestjs/common'
import {
  QuoteWatchInteractor,
  IPendingQuote,
} from 'src/common/classes/interactors/quote-watch-interactor.class'
import { ClientProxy } from '@nestjs/microservices'
import MicroserviceMessages from 'src/common/enums/microservice-messages.enum'

@Injectable()
export class QuoteWatchInteractorService extends QuoteWatchInteractor {
  constructor(private msClient: ClientProxy) {
    super()
  }

  approveByMessageId(messageId: string): Promise<IPendingQuote> {
    return this.msClient
      .send(MicroserviceMessages.APPROVE_QUOTE, messageId)
      .toPromise()
  }

  getPendingQuotes(serverId: string): Promise<IPendingQuote[]> {
    return this.msClient
      .send(MicroserviceMessages.GET_PENDING_QUOTES, serverId)
      .toPromise()
  }

  flagAsLost(messageId: string): Promise<IPendingQuote> {
    return this.msClient
      .send(MicroserviceMessages.FLAG_AS_LOST, messageId)
      .toPromise()
  }
}
