import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { QuoteSubmitInteractorService } from './quote-submit-interactor/quote-submit-interactor.service'

@Module({
  imports: [ProvidersModule],
  providers: [QuoteSubmitInteractorService],
  exports: [QuoteSubmitInteractorService],
})
export class InteractorsModule {}
