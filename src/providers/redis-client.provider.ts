import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { Provider } from '@nestjs/common'

const { MQ_URI } = process.env

export default {
  provide: ClientProxy,
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: MQ_URI,
      },
    })
  },
} as Provider
