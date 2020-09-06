import { Module } from '@nestjs/common'
import { ReactionMonitoringWorkerService } from './reaction-monitoring-worker/reaction-monitoring-worker.service';

@Module({
  providers: [ReactionMonitoringWorkerService],
})
export class WorkersModule {}
