import { Module } from '@nestjs/common'
import { InteractorsModule } from './interactors/interactors.module'
import { ServicesModule } from './services/services.module'
import { ProvidersModule } from './providers/providers.module'
import { ControllersModule } from './controllers/controllers.module';

@Module({
  imports: [InteractorsModule, ServicesModule, ProvidersModule, ControllersModule],
})
export class AppModule {}
