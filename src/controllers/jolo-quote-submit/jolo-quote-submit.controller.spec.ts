import { Test, TestingModule } from '@nestjs/testing';
import { JoloQuoteSubmitController } from './jolo-quote-submit.controller';

describe('JoloQuoteSubmitController', () => {
  let controller: JoloQuoteSubmitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JoloQuoteSubmitController],
    }).compile();

    controller = module.get<JoloQuoteSubmitController>(JoloQuoteSubmitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
