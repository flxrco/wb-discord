import IApprovalRequirements from 'src/common/interfaces/models/approval-requirements.interface'

export default abstract class ApprovalRequirementsRepository {
  abstract getRequirements(
    guildId: string,
    channelId: string
  ): Promise<IApprovalRequirements>
}
