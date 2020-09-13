import { Module } from '@nestjs/common'
import { utilities, WinstonModule } from 'nest-winston'
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
            utilities.format.nestLike()
          ),
        }),
      ],
      level: 'debug',
    }),
  ],
})
export class AppModule {}
