import { Module } from '@nestjs/common'
import { ProvidersModule } from 'src/providers/providers.module'
import { GuildUtilsService } from './guild-utils/guild-utils.service'
import { ReactionsWatcherService } from './reactions-watcher/reactions-watcher.service'

@Module({
  providers: [GuildUtilsService, ReactionsWatcherService],
  imports: [ProvidersModule],
  exports: [GuildUtilsService, ReactionsWatcherService],
})
export class ServicesModule {}
