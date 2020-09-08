import { Test, TestingModule } from '@nestjs/testing';
import { QuoteReceiveController } from './quote-receive.controller';

describe('QuoteReceiveController', () => {
  let controller: QuoteReceiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteReceiveController],
    }).compile();

    controller = module.get<QuoteReceiveController>(QuoteReceiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
