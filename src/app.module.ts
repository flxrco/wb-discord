import { Module, Logger } from '@nestjs/common'
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WINSTON_MODULE_NEST_PROVIDER,
} from 'nest-winston'
import * as winston from 'winston'
import { InteractorsModule } from './interactors/interactors.module'
import { ServicesModule } from './services/services.module'
import { ProvidersModule } from './providers/providers.module'
import { ControllersModule } from './controllers/controllers.module'
import { RepositoriesModule } from './repositories/repositories.module'

@Module({
  imports: [
    InteractorsModule,
    ServicesModule,
    ProvidersModule,
    ControllersModule,
    RepositoriesModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike()
          ),
        }),
        // other transports...
      ],
      level: 'debug',
      // other options
    }),
  ],
})
export class AppModule {}
