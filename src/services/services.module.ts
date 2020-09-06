import { Module } from '@nestjs/common';
import { ReactionWatcherFactoryService } from './reaction-watcher-factory/reaction-watcher-factory.service';

@Module({
  providers: [ReactionWatcherFactoryService]
})
export class ServicesModule {}
