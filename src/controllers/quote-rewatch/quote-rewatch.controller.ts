import { Controller } from '@nestjs/common'
import { QuoteSubmitInteractorService } from 'src/interactors/quote-submit-interactor/quote-submit-interactor.service'
import { Client, Guild, TextChannel } from 'discord.js'
import { ReactionsWatcherService } from 'src/services/reactions-watcher/reactions-watcher.service'
import { ISubmitQuoteOutput } from 'src/common/core/classes/interactors/quote-submit-interactor.class'
import IEmojiRequirements from 'src/common/interfaces/emoji-requirements.interface'

@Controller()
export class QuoteRewatchController {
  constructor(
    private watchSvc: ReactionsWatcherService,
    private submitInt: QuoteSubmitInteractorService,
    private client: Client
  ) {
    this.processGuilds()
  }

  private async processGuilds() {
    const guilds = [...this.client.guilds.cache.values()]
    for (const guild of guilds) {
      await this.processGuild(guild)
    }
  }

  private async processGuild(guild: Guild) {
    const [messages, channels] = await Promise.all([
      this.getMessagesToWatch(guild),
      this.getTextChannels(guild),
    ])

    await this.watchMessages(channels, messages)
  }

  private async getMessagesToWatch({ id }: Guild): Promise<MessageMap> {
    const found = await this.submitInt.getPendingQuotes(id)
    return found.reduce((map, pending) => {
      const { approvalStatus } = pending
      map[approvalStatus.messageId] = pending
      return map
    }, {})
  }

  private async getTextChannels({ channels }: Guild): Promise<TextChannel[]> {
    return [...channels.cache.values()]
      .filter(({ type, viewable }) => type === 'text' && viewable)
      .map(data => data as TextChannel)
  }

  private async watchMessages(
    channels: TextChannel[],
    messageMap: MessageMap
  ): Promise<void> {
    // TODO place this in a damn repository or something
    const reqs = {
      emoji: '🤔',
      amount: 1,
    }

    for (const channel of channels) {
      if (!Object.keys(messageMap).length) {
        break
      }

      await this.findAndWatchMessagesInChannel(channel, messageMap, reqs)
    }
  }

  private async findAndWatchMessagesInChannel(
    { messages }: TextChannel,
    messageMap: MessageMap,
    reqs: IEmojiRequirements
  ) {
    const ids = Object.keys(messageMap)

    for (const id of ids) {
      const result = await messages.fetch(id)
      if (!result) {
        continue
      }

      this.watchSvc.watchSubmission(messageMap[id], result, reqs)

      delete messageMap[id]
    }
  }
}

type MessageMap = Record<string, ISubmitQuoteOutput>
