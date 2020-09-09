import { Test, TestingModule } from '@nestjs/testing';
import { MockCommandPrefixRepositoryService } from './mock-command-prefix-repository.service';

describe('MockCommandPrefixRepositoryService', () => {
  let service: MockCommandPrefixRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockCommandPrefixRepositoryService],
    }).compile();

    service = module.get<MockCommandPrefixRepositoryService>(MockCommandPrefixRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
