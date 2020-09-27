import { Test, TestingModule } from '@nestjs/testing';
import { MockQuoteExpirationRepositoryService } from './mock-quote-expiration-repository.service';

describe('MockQuoteExpirationRepositoryService', () => {
  let service: MockQuoteExpirationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockQuoteExpirationRepositoryService],
    }).compile();

    service = module.get<MockQuoteExpirationRepositoryService>(MockQuoteExpirationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
