import { Module } from '@nestjs/common'
import { QuoteCreateGatewayService } from './quote-create-gateway/quote-create-gateway.service'
import { ProvidersModule } from 'src/providers/providers.module'

@Module({
  providers: [QuoteCreateGatewayService],
  exports: [QuoteCreateGatewayService],
  imports: [ProvidersModule],
})
export class GatewaysModule {}
