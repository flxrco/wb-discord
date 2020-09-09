import { Module } from '@nestjs/common'
import { MockCommandPrefixRepositoryService } from './mock-command-prefix-repository/mock-command-prefix-repository.service'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'

@Module({
  providers: [
    {
      provide: CommandPrefixRepository,
      useClass: MockCommandPrefixRepositoryService,
    },
  ],
  exports: [CommandPrefixRepository],
})
export class RepositoriesModule {}
