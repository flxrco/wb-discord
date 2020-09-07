import { Injectable } from '@nestjs/common'
import { Client } from 'discord.js'

@Injectable()
export class GuildUtilsService {
  constructor(private client: Client) {}

  async getGuild(id: string) {
    return await this.client.guilds.fetch(id)
  }

  async getEmoji(
    keyword: string,
    category: 'id' | 'identifier' | 'name',
    guildId: string
  ) {
    const filters = {
      id: e => e.id === keyword,
      identifier: e => e.identifier === keyword,
      name: e => e.name === keyword,
    }

    const g = await this.getGuild(guildId)
    return g.emojis.cache.find(filters[category])
  }
}
