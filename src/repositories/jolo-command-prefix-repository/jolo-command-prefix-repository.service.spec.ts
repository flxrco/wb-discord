import { Test, TestingModule } from '@nestjs/testing';
import { JoloCommandPrefixRepositoryService } from './jolo-command-prefix-repository.service';

describe('JoloCommandPrefixRepositoryService', () => {
  let service: JoloCommandPrefixRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JoloCommandPrefixRepositoryService],
    }).compile();

    service = module.get<JoloCommandPrefixRepositoryService>(JoloCommandPrefixRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
