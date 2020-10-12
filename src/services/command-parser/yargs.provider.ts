import { Provider } from '@nestjs/common'
import yargs = require('yargs')

export const YARGS_PROVIDER = 'YARGS_PROVIDER'

// TODO stick this up in a provider or something, jesus
const YARGS_INSTANCE = yargs
  .command(['submit <content> <author> [year]', 'add'], false, yargs => {
    yargs.positional('year', {
      type: 'number',
    })
  })
  .command('receive [author]', false, yargs => {
    yargs.option('exclude', {
      boolean: true,
    })
  })
  .command('help', false)
  .wrap(null)
  .version(false)
  .strict(true)

export default {
  provide: YARGS_PROVIDER,
  useValue: YARGS_INSTANCE,
} as Provider
