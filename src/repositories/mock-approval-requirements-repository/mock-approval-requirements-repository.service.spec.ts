import { Test, TestingModule } from '@nestjs/testing';
import { MockApprovalRequirementsRepositoryService } from './mock-approval-requirements-repository.service';

describe('MockApprovalRequirementsRepositoryService', () => {
  let service: MockApprovalRequirementsRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockApprovalRequirementsRepositoryService],
    }).compile();

    service = module.get<MockApprovalRequirementsRepositoryService>(MockApprovalRequirementsRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
