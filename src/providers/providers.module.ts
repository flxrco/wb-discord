import { Module } from '@nestjs/common'
import DiscordClientProvider from './discord-client.provider'
import { Client } from 'discord.js'
import { ClientProxy } from '@nestjs/microservices'
import RedisClientProvider from './redis-client.provider'

@Module({
  providers: [DiscordClientProvider, RedisClientProvider],
  exports: [Client, ClientProxy],
})
export class ProvidersModule {}
