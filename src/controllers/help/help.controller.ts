import { Controller } from '@nestjs/common'
import { MessageEmbed } from 'discord.js'
import { filter } from 'rxjs/operators'
import CommandParser, {
  Command,
  IParseResults,
} from 'src/common/classes/services/command-parser.class'

@Controller()
export class HelpController {
  constructor(private parseSvc: CommandParser) {
    this.helped$.subscribe(this.handler.bind(this))
  }

  private get helped$() {
    return this.parseSvc
      .getOnParseObservable()
      .pipe(filter(({ command }) => command === Command.HELP))
  }

  private handler({ message, prefix }: IParseResults) {
    const { channel } = message

    const embed = new MessageEmbed()
      .setColor('#590995')
      .setTitle('Wisdom Bot Commands')
      .setDescription(
        'Here is the list of the commands for the Wisdom Bot. \
      Parameters encased in `<angled brackets>` are required parameters while the ones in \
      `[braces]` are optional.'
      )
      .addFields(
        {
          name: [prefix, 'submit <quote> <author> [year]'].join(' '),
          value:
            "Submits a quote for approval. `<quote>` must be encased in quotes (' or \") if it's composed of more than one word.\
          `[author]` must be a mention to a user within the server.\
          `[year]` must be a whole number between 1970 and the current year.",
        },
        {
          name: [prefix, 'receive [author] [--exclude]'].join(' '),
          value:
            'Fetches a random quote from the database. If a mention to an [author] was provided, the quotes that will be received\
          will be from the mentioned `[author]` only. If `[author]` was provided, you can also provide `[--exclude]` which does the opposite.',
        }
      )

    channel.send(embed)
  }
}
