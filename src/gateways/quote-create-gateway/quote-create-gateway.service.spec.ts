import { Test, TestingModule } from '@nestjs/testing';
import { QuoteCreateGatewayService } from './quote-create-gateway.service';

describe('QuoteCreateGatewayService', () => {
  let service: QuoteCreateGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteCreateGatewayService],
    }).compile();

    service = module.get<QuoteCreateGatewayService>(QuoteCreateGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
