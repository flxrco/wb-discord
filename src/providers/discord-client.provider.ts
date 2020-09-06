import { Provider } from '@nestjs/common'
import { Client } from 'discord.js'

import 'dotenv-defaults/config'
const { DISCORD_TOKEN } = process.env

export const DiscordClient: Provider = {
  provide: Client,
  useFactory: () =>
    new Promise((resolve, reject) => {
      const client = new Client()
      try {
        console.log('Attempting to sign in.')
        client.login(DISCORD_TOKEN)
        client.on('ready', () => {
          resolve(client)
          console.log('Sign in successful.')
        })
      } catch (e) {
        reject(e)
      }
    }),
}
