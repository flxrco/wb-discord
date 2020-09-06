import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { Provider } from '@nestjs/common'
import 'dotenv-defaults/config'

const { MQ_URI } = process.env

export const RedisClient: Provider = {
  provide: ClientProxy,
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: MQ_URI,
      },
    })
  },
}
