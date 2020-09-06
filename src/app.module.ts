import { Module } from '@nestjs/common'
import { WorkersModule } from './workers/workers.module'
import { InteractorsModule } from './interactors/interactors.module'
import { GatewaysModule } from './gateways/gateways.module'

@Module({
  imports: [WorkersModule, InteractorsModule, GatewaysModule],
})
export class AppModule {}
