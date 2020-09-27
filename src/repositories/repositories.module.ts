import { Module } from '@nestjs/common'
import { MockCommandPrefixRepositoryService } from './mock-command-prefix-repository/mock-command-prefix-repository.service'
import { MockApprovalRequirementsRepositoryService } from './mock-approval-requirements-repository/mock-approval-requirements-repository.service'
import { MockQuoteExpirationRepositoryService } from './mock-quote-expiration-repository/mock-quote-expiration-repository.service'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'
import ApprovalRequirementsRepository from 'src/common/classes/repositories/approval-requirements-repository.class'
import QuoteEpxirationRepository from 'src/common/classes/repositories/quote-expiration-repository.class'

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
    {
      provide: QuoteEpxirationRepository,
      useClass: MockQuoteExpirationRepositoryService,
    },
  ],
  exports: [
    CommandPrefixRepository,
    ApprovalRequirementsRepository,
    QuoteEpxirationRepository,
  ],
})
export class RepositoriesModule {}
