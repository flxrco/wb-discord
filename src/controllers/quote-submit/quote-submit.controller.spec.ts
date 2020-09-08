import { Test, TestingModule } from '@nestjs/testing';
import { QuoteSubmitController } from './quote-submit.controller';

describe('QuoteSubmitController', () => {
  let controller: QuoteSubmitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteSubmitController],
    }).compile();

    controller = module.get<QuoteSubmitController>(QuoteSubmitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
