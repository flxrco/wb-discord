export default interface IQuote extends IBaseQuote {
  quoteId: string
}

export interface IBaseQuote {
  content: string

  authorId: string

  // 1970 - current
  yearOverride?: number

  submitterId: string
  submitDt: Date

  serverId: string
}
