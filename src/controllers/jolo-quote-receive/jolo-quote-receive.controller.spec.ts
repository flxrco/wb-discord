import { Test, TestingModule } from '@nestjs/testing';
import { JoloQuoteReceiveController } from './jolo-quote-receive.controller';

describe('JoloQuoteReceiveController', () => {
  let controller: JoloQuoteReceiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JoloQuoteReceiveController],
    }).compile();

    controller = module.get<JoloQuoteReceiveController>(JoloQuoteReceiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
