import { Test, TestingModule } from '@nestjs/testing';
import { ReactionMonitoringWorkerService } from './reaction-monitoring-worker.service';

describe('ReactionMonitoringWorkerService', () => {
  let service: ReactionMonitoringWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionMonitoringWorkerService],
    }).compile();

    service = module.get<ReactionMonitoringWorkerService>(ReactionMonitoringWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
