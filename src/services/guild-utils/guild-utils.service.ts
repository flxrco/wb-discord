import { Injectable } from '@nestjs/common'
import { Client } from 'discord.js'

@Injectable()
export class GuildUtilsService {
  constructor(private client: Client) {}

  async getGuild(id: string) {
    return await this.client.guilds.fetch(id)
  }

  async getEmoji(identifier: string, guildId: string) {
    const g = await this.getGuild(guildId)
    return g.emojis.cache.find(
      e =>
        e.identifier === identifier ||
        e.name === identifier ||
        e.id === identifier
    )
  }
}
