import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { QuoteSubmitInteractorService } from './quote-submit-interactor/quote-submit-interactor.service'
import { QuoteWatchInteractorService } from './quote-watch-interactor/quote-watch-interactor.service'
import QuoteSubmitInteractor from 'src/common/classes/interactors/quote-submit-interactor.class'
import { QuoteWatchInteractor } from 'src/common/classes/interactors/quote-watch-interactor.class'

@Module({
  imports: [ProvidersModule],

  providers: [
    {
      provide: QuoteSubmitInteractor,
      useClass: QuoteSubmitInteractorService,
    },
    {
      useClass: QuoteWatchInteractorService,
      provide: QuoteWatchInteractor,
    },
  ],

  exports: [QuoteSubmitInteractor, QuoteWatchInteractor],
})
export class InteractorsModule {}
