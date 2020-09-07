import { Test, TestingModule } from '@nestjs/testing';
import { QuoteSubmitInteractorService } from './quote-submit-interactor.service';

describe('QuoteSubmitInteractorService', () => {
  let service: QuoteSubmitInteractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteSubmitInteractorService],
    }).compile();

    service = module.get<QuoteSubmitInteractorService>(QuoteSubmitInteractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
