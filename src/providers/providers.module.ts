import { Module } from '@nestjs/common'
import DiscordClientProvider from './discord-client.provider'
import { Client } from 'discord.js'
import { ClientProxy } from '@nestjs/microservices'
import RedisClientProvider from './redis-client.provider'
import MomentProvider, { MOMENT_PROVIDER } from './moment.provider'

@Module({
  providers: [DiscordClientProvider, RedisClientProvider, MomentProvider],
  exports: [Client, ClientProxy, MOMENT_PROVIDER],
})
export class ProvidersModule {}
