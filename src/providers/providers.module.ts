import { Module } from '@nestjs/common'
import { DiscordClient } from './discord-client.provider'
import { Client } from 'discord.js'
import { ClientProxy } from '@nestjs/microservices'
import { RedisClient } from './redis-client.provider'

@Module({
  providers: [DiscordClient, RedisClient],
  exports: [Client, ClientProxy],
})
export class ProvidersModule {}
