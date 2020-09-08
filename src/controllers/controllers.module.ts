import { Module } from '@nestjs/common'
import { InteractorsModule } from 'src/interactors/interactors.module'
import { ProvidersModule } from 'src/providers/providers.module'
import { ServicesModule } from 'src/services/services.module'
import { QuoteSubmitController } from './quote-submit/quote-submit.controller'
import { QuoteReceiveController } from './quote-receive/quote-receive.controller';
import { QuoteApproveController } from './quote-approve/quote-approve.controller';

@Module({
  providers: [],
  imports: [
    InteractorsModule,
    ProvidersModule,
    ServicesModule,
    InteractorsModule,
  ],
  controllers: [QuoteSubmitController, QuoteReceiveController, QuoteApproveController],
})
export class ControllersModule {}
