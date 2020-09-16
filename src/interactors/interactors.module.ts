import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { QuoteSubmitInteractorService } from './quote-submit-interactor/quote-submit-interactor.service'
import { QuoteWatchInteractorService } from './quote-watch-interactor/quote-watch-interactor.service'
import QuoteSubmitInteractor from 'src/common/classes/interactors/quote-submit-interactor.class'
import { QuoteWatchInteractor } from 'src/common/classes/interactors/quote-watch-interactor.class'
import { QuoteReceiveInteractorService } from './quote-receive-interactor/quote-receive-interactor.service'
import QuoteReceiveInteractor from 'src/common/classes/interactors/quote-receive-interactor.class'

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
    {
      useClass: QuoteReceiveInteractorService,
      provide: QuoteReceiveInteractor,
    },
  ],

  exports: [
    QuoteSubmitInteractor,
    QuoteWatchInteractor,
    QuoteReceiveInteractor,
  ],
})
export class InteractorsModule {}
