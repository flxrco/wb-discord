import { Test, TestingModule } from '@nestjs/testing';
import { QuoteRewatchController } from './quote-rewatch.controller';

describe('QuoteRewatchController', () => {
  let controller: QuoteRewatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteRewatchController],
    }).compile();

    controller = module.get<QuoteRewatchController>(QuoteRewatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
