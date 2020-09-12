import { Test, TestingModule } from '@nestjs/testing';
import { QuoteWatchInteractorService } from './quote-watch-interactor.service';

describe('QuoteWatchInteractorService', () => {
  let service: QuoteWatchInteractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteWatchInteractorService],
    }).compile();

    service = module.get<QuoteWatchInteractorService>(QuoteWatchInteractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
