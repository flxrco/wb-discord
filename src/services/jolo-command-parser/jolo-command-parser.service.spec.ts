import { Test, TestingModule } from '@nestjs/testing';
import { JoloCommandParserService } from './jolo-command-parser.service';

describe('JoloCommandParserService', () => {
  let service: JoloCommandParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JoloCommandParserService],
    }).compile();

    service = module.get<JoloCommandParserService>(JoloCommandParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
