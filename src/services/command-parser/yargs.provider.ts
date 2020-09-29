import { Provider } from '@nestjs/common'
import yargs = require('yargs')

export const YARGS_PROVIDER = 'YARGS_PROVIDER'

// TODO stick this up in a provider or something, jesus
const YARGS_INSTANCE = yargs
  .command(
    ['submit <content> <author> [year]', 'add'],
    'Submit a quote for approval.',
    yargs => {
      yargs
        .positional('content', { describe: 'The content of the quote.' })
        .positional('author', {
          describe:
            'The author of the quote. Can be a mention (e.g. @Wisdom) or a plain string (e.g. "Socrates").',
        })
        .positional('year', {
          describe:
            'Overrides the year of the quote. If no value was provided, the quote year will be the current year.',
          type: 'number',
        })
        .help()
    }
  )
  .command(
    'receive [author]',
    'Fetches a random quote from the database.',
    yargs => {
      yargs
        .positional('author', {
          description:
            'Must be a mention to a user. If a value was provided, then the quote to be received will be filtered to the ones from the author.',
        })
        .option('exclude', {
          boolean: true,
        })
        .help()
    }
  )
  .help()
  .wrap(null)
  .version(false)
  .strict(true)

export default {
  provide: YARGS_PROVIDER,
  useValue: YARGS_INSTANCE,
} as Provider
