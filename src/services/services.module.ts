import { Module } from '@nestjs/common'
import { ReactionWatcherFactoryService } from './reaction-watcher-factory/reaction-watcher-factory.service'
import { ProvidersModule } from 'src/providers/providers.module'
import { GuildUtilsService } from './guild-utils/guild-utils.service'

@Module({
  providers: [ReactionWatcherFactoryService, GuildUtilsService],
  imports: [ProvidersModule],
  exports: [ReactionWatcherFactoryService, GuildUtilsService],
})
export class ServicesModule {}
