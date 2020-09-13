import { Module } from '@nestjs/common'
import { InteractorsModule } from 'src/interactors/interactors.module'
import { ProvidersModule } from 'src/providers/providers.module'
import { ServicesModule } from 'src/services/services.module'
import { QuoteSubmitController } from './quote-submit/quote-submit.controller'
import { QuoteReceiveController } from './quote-receive/quote-receive.controller'
import { QuoteApproveController } from './quote-approve/quote-approve.controller'
import { QuoteRejectController } from './quote-reject/quote-reject.controller'
import { QuoteRewatchController } from './quote-rewatch/quote-rewatch.controller'
import { RepositoriesModule } from 'src/repositories/repositories.module'

@Module({
  imports: [
    InteractorsModule,
    ProvidersModule,
    ServicesModule,
    InteractorsModule,
    RepositoriesModule,
  ],
  controllers: [
    QuoteSubmitController,
    QuoteReceiveController,
    QuoteApproveController,
    QuoteRejectController,
    QuoteRewatchController,
  ],
})
export class ControllersModule {}
