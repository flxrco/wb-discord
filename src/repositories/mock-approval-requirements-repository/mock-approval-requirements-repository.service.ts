/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import ApprovalRequirementsRepository from 'src/common/classes/repositories/approval-requirements-repository.class'
import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'

@Injectable()
export class MockApprovalRequirementsRepositoryService extends ApprovalRequirementsRepository {
  async getRequirements(
    guildId: string,
    channelId: string
  ): Promise<IApprovalRequirements> {
    return {
      count: 3,
      emoji: '🤔',
    }
  }
}
