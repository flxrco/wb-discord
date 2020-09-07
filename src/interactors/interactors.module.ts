import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { GatewaysModule } from 'src/gateways/gateways.module'

@Module({
  imports: [ProvidersModule, GatewaysModule],
})
export class InteractorsModule {}
