import { Test, TestingModule } from '@nestjs/testing';
import { CommandParserService } from './command-parser.service';

describe('CommandParserService', () => {
  let service: CommandParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandParserService],
    }).compile();

    service = module.get<CommandParserService>(CommandParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
