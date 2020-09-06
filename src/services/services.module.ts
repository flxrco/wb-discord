import { Module } from '@nestjs/common'
import { ReactionWatcherFactoryService } from './reaction-watcher-factory/reaction-watcher-factory.service'
import { ProvidersModule } from 'src/providers/providers.module'

@Module({
  providers: [ReactionWatcherFactoryService],
  imports: [ProvidersModule],
})
export class ServicesModule {}
