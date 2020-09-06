import { Test, TestingModule } from '@nestjs/testing';
import { ReactionWatcherFactoryService } from './reaction-watcher-factory.service';

describe('ReactionWatcherFactoryService', () => {
  let service: ReactionWatcherFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionWatcherFactoryService],
    }).compile();

    service = module.get<ReactionWatcherFactoryService>(ReactionWatcherFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
