import { Module } from '@nestjs/common'
import { MockCommandPrefixRepositoryService } from './mock-command-prefix-repository/mock-command-prefix-repository.service'
import { MockApprovalRequirementsRepositoryService } from './mock-approval-requirements-repository/mock-approval-requirements-repository.service'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'
import ApprovalRequirementsRepository from 'src/common/classes/repositories/approval-requirements-repository.class'

@Module({
  providers: [
    {
      provide: CommandPrefixRepository,
      useClass: MockCommandPrefixRepositoryService,
    },
    {
      provide: ApprovalRequirementsRepository,
      useClass: MockApprovalRequirementsRepositoryService,
    },
  ],
  exports: [CommandPrefixRepository, ApprovalRequirementsRepository],
})
export class RepositoriesModule {}
