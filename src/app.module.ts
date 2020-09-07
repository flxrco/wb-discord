import { Module } from '@nestjs/common'
import { InteractorsModule } from './interactors/interactors.module'
import { ServicesModule } from './services/services.module'
import { ProvidersModule } from './providers/providers.module'

@Module({
  imports: [InteractorsModule, ServicesModule, ProvidersModule],
})
export class AppModule {}
