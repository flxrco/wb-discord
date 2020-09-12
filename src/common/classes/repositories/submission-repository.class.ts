import { IPendingQuote } from '../interactors/quote-watch-interactor.class'
import ISubmissionStatus, {
  IBaseSubmissionStatus,
} from 'src/common/interfaces/models/submission-status.interface'
import ISubmissionVerdict from 'src/common/interfaces/models/submission-verdict.interface'

export default abstract class SubmissionRepository {
  abstract getPendingQuotes(serverId: string): Promise<IPendingQuote[]>

  abstract setSubmissionStatus(
    quoteId: string,
    submission: IBaseSubmissionStatus | null
  ): Promise<ISubmissionStatus>

  abstract getSubmissionStatus(quoteId: string): Promise<ISubmissionStatus>

  abstract setSubmissionVerdict(
    quoteId: string,
    submission: ISubmissionVerdict | null
  ): Promise<ISubmissionVerdict>

  abstract findPendingQuotebyMessage(messageId: string): Promise<IPendingQuote>
}
