import { Injectable } from '@nestjs/common'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'
import { of } from 'rxjs'

@Injectable()
export class MockCommandPrefixRepositoryService extends CommandPrefixRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getGuildPrefix$(id: string) {
    return of('&wisdom')
  }
}
