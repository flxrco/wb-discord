import { Module } from '@nestjs/common'
import { InteractorsModule } from './interactors/interactors.module'
import { GatewaysModule } from './gateways/gateways.module'
import { ServicesModule } from './services/services.module'

@Module({
  imports: [InteractorsModule, GatewaysModule, ServicesModule],
})
export class AppModule {}
