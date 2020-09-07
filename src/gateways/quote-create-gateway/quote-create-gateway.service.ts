import { Injectable } from '@nestjs/common'
import QuoteSubmitInteractor, {
  ISubmitQuoteInput,
  ISubmitQuoteOutput,
  IApproveQuoteOutput,
  IGetPendingQuotesOutput,
} from 'src/common/core/classes/interactors/quote-submit-interactor.class'

import MicroserviceMessages from 'src/common/core/enums/microservice-messages.enum'

import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class QuoteCreateGatewayService extends QuoteSubmitInteractor {
  constructor(private redis: ClientProxy) {
    super()
  }

  async submitQuote(input: ISubmitQuoteInput): Promise<ISubmitQuoteOutput> {
    return await this.redis
      .send<ISubmitQuoteOutput>(MicroserviceMessages.SUBMIT_QUOTE, input)
      .toPromise()
  }

  async approveQuote(messageId: string): Promise<IApproveQuoteOutput> {
    return await this.redis
      .send<IApproveQuoteOutput>(MicroserviceMessages.APPROVE_QUOTE, messageId)
      .toPromise()
  }

  async getPendingQuotes(serverId: string): Promise<IGetPendingQuotesOutput> {
    return await this.redis
      .send<IGetPendingQuotesOutput>(
        MicroserviceMessages.GET_PENDING_QUOTES,
        serverId
      )
      .toPromise()
  }
}
