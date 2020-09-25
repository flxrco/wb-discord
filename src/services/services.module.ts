import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { ReactionsWatcherService } from './reactions-watcher/reactions-watcher.service'
import { RepositoriesModule } from 'src/repositories/repositories.module'
import { MessageWatcherService } from './message-watcher/message-watcher.service'
import { CommandParserService } from './command-parser/command-parser.service'
import { ExecutorService } from './executor/executor.service'
import CommandParser from 'src/common/classes/services/command-parser.class'
@Module({
  providers: [
    ReactionsWatcherService,
    MessageWatcherService,
    {
      useClass: CommandParserService,
      provide: CommandParser,
    },
    ExecutorService,
  ],

  imports: [ProvidersModule, RepositoriesModule],
  exports: [ReactionsWatcherService, CommandParser, ExecutorService],
})
export class ServicesModule {}
