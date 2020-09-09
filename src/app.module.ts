import { Module } from '@nestjs/common'
import { InteractorsModule } from './interactors/interactors.module'
import { ServicesModule } from './services/services.module'
import { ProvidersModule } from './providers/providers.module'
import { ControllersModule } from './controllers/controllers.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [InteractorsModule, ServicesModule, ProvidersModule, ControllersModule, RepositoriesModule],
})
export class AppModule {}
