import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { GuildUtilsService } from './guild-utils/guild-utils.service'
import { ReactionsWatcherService } from './reactions-watcher/reactions-watcher.service'
import { RepositoriesModule } from 'src/repositories/repositories.module'
import { MessageWatcherService } from './message-watcher/message-watcher.service'
import { CommandParserService } from './command-parser/command-parser.service'
@Module({
  providers: [
    GuildUtilsService,
    ReactionsWatcherService,
    MessageWatcherService,
    CommandParserService,
  ],

  imports: [ProvidersModule, RepositoriesModule],
  exports: [GuildUtilsService, ReactionsWatcherService, CommandParserService],
})
export class ServicesModule {}
