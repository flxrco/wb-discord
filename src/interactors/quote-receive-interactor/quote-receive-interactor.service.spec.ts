import { Test, TestingModule } from '@nestjs/testing';
import { QuoteReceiveInteractorService } from './quote-receive-interactor.service';

describe('QuoteReceiveInteractorService', () => {
  let service: QuoteReceiveInteractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteReceiveInteractorService],
    }).compile();

    service = module.get<QuoteReceiveInteractorService>(QuoteReceiveInteractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
