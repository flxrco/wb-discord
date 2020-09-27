/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import QuoteEpxirationRepository from 'src/common/classes/repositories/quote-expiration-repository.class'
import moment = require('moment-timezone')

@Injectable()
export class MockQuoteExpirationRepositoryService extends QuoteEpxirationRepository {
  async computeExpirationDate(
    guildId: string,
    channelId: string
  ): Promise<Date> {
    return moment()
      .add(7, 'days')
      .toDate()
  }
}
