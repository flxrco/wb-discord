import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { ReactionsWatcherService } from './reactions-watcher/reactions-watcher.service'
import { RepositoriesModule } from 'src/repositories/repositories.module'
import { MessageWatcherService } from './message-watcher/message-watcher.service'
import { CommandParserService } from './command-parser/command-parser.service'
import { ExecutorService } from './executor/executor.service'
import CommandService from 'src/common/classes/services/command-service.class'
@Module({
  providers: [
    ReactionsWatcherService,
    MessageWatcherService,
    {
      useClass: CommandParserService,
      provide: CommandService,
    },
    ExecutorService,
  ],

  imports: [ProvidersModule, RepositoriesModule],
  exports: [ReactionsWatcherService, CommandService, ExecutorService],
})
export class ServicesModule {}
