import { Test, TestingModule } from '@nestjs/testing';
import { QuoteRejectController } from './quote-reject.controller';

describe('QuoteRejectController', () => {
  let controller: QuoteRejectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteRejectController],
    }).compile();

    controller = module.get<QuoteRejectController>(QuoteRejectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
