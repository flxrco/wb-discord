import ISubmissionVerdict from './submission-verdict.interface'
import IApprovalRequirements from './approval-requirements.interface'

export default interface ISubmissionStatus extends IBaseSubmissionStatus {
  isApproved: boolean
  isPending: boolean
  verdict?: ISubmissionVerdict
}

export interface IBaseSubmissionStatus {
  messageId: string
  messageDt: Date

  channelId: string

  expireDt: Date

  requirements: IApprovalRequirements
}
