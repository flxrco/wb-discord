export default class InteractorError extends Error {
  constructor(private errCode: InteractorErrorCodes) {
    super()
  }
}

export enum InteractorErrorCodes {
  QUOTE_APPROVED = 'Quote Approved',
  QUOTE_EXPIRED = 'Quote Expired',
  QUOTE_NOT_FOUND = 'Quote Not Found',
  NO_AVAILABLE_QUOTES = 'No Quotes Available',
}
