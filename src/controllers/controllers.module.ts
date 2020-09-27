import { Module } from '@nestjs/common'
import { InteractorsModule } from 'src/interactors/interactors.module'
import { ProvidersModule } from 'src/providers/providers.module'
import { ServicesModule } from 'src/services/services.module'
import { RepositoriesModule } from 'src/repositories/repositories.module'
import { JoloQuoteReceiveController } from './jolo-quote-receive/jolo-quote-receive.controller'
import { JoloQuoteSubmitController } from './jolo-quote-submit/jolo-quote-submit.controller'

@Module({
  imports: [
    InteractorsModule,
    ProvidersModule,
    ServicesModule,
    InteractorsModule,
    RepositoriesModule,
  ],
  controllers: [JoloQuoteReceiveController, JoloQuoteSubmitController],
})
export class ControllersModule {}
