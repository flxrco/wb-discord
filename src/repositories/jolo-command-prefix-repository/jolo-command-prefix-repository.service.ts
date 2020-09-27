/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import { of } from 'rxjs'
import CommandPrefixRepository from 'src/common/classes/repositories/command-prefix-repository.class'

@Injectable()
export class JoloCommandPrefixRepositoryService extends CommandPrefixRepository {
  getGuildPrefix$(id: string) {
    return of('!wisdom')
  }
}
