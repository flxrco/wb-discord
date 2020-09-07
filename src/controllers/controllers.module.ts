import { Module } from '@nestjs/common'
import { InteractorsModule } from 'src/interactors/interactors.module'
import { ProvidersModule } from 'src/providers/providers.module'
import { QuoteSubmitControllerService } from './quote-submit-controller/quote-submit-controller.service'
import { ServicesModule } from 'src/services/services.module'

@Module({
  providers: [QuoteSubmitControllerService],
  imports: [
    InteractorsModule,
    ProvidersModule,
    ServicesModule,
    InteractorsModule,
  ],
})
export class ControllersModule {}
