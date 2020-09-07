import { Test, TestingModule } from '@nestjs/testing';
import { QuoteSubmitControllerService } from './quote-submit-controller.service';

describe('QuoteSubmitControllerService', () => {
  let service: QuoteSubmitControllerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteSubmitControllerService],
    }).compile();

    service = module.get<QuoteSubmitControllerService>(QuoteSubmitControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
