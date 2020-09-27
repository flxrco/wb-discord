import { Provider } from '@nestjs/common'

export const AUTHOR_ID = 'AUTHOR_ID'

export default {
  provide: AUTHOR_ID,
  useValue: '169744487474528256',
} as Provider
