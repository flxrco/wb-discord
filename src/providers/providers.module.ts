import { Module } from '@nestjs/common'
import { DiscordClient } from './discord-client.provider'
import { Client } from 'discord.js'

@Module({
  providers: [DiscordClient],
  exports: [Client],
})
export class ProvidersModule {}
