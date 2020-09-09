import { Test, TestingModule } from '@nestjs/testing';
import { MessageWatcherService } from './message-watcher.service';

describe('MessageWatcherService', () => {
  let service: MessageWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageWatcherService],
    }).compile();

    service = module.get<MessageWatcherService>(MessageWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
