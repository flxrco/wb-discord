import { Injectable } from '@nestjs/common'
import { Client } from 'discord.js'

@Injectable()
export class GuildUtilsService {
  constructor(private client: Client) {}

  async getGuild(id: string) {
    return await this.client.guilds.fetch(id)
  }

  async getGuildEmojiManager(guildId: string) {
    const guild = await this.getGuild(guildId)
    return guild.emojis
  }

  async getEmojiById(emojiId: string, guildId: string) {
    const mgr = await this.getGuildEmojiManager(guildId)
    return await mgr.resolveID(emojiId)
  }

  async getEmojiByIdentifier(identifier: string, guildId: string) {
    const mgr = await this.getGuildEmojiManager(guildId)
    return await mgr.resolveIdentifier(identifier)
  }
}
