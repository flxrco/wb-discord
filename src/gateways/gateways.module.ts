import { Module } from '@nestjs/common';
import { QuoteCreateGatewayService } from './quote-create-gateway/quote-create-gateway.service';

@Module({
  providers: [QuoteCreateGatewayService]
})
export class GatewaysModule {}
