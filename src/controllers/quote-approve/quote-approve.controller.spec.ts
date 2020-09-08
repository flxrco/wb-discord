import { Test, TestingModule } from '@nestjs/testing';
import { QuoteApproveController } from './quote-approve.controller';

describe('QuoteApproveController', () => {
  let controller: QuoteApproveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteApproveController],
    }).compile();

    controller = module.get<QuoteApproveController>(QuoteApproveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
