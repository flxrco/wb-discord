import { Test, TestingModule } from '@nestjs/testing';
import { GuildUtilsService } from './guild-utils.service';

describe('GuildUtilsService', () => {
  let service: GuildUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuildUtilsService],
    }).compile();

    service = module.get<GuildUtilsService>(GuildUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
