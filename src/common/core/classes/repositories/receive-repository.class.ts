import IReceive, {
  IBaseReceive,
} from 'src/common/interfaces/models/receive.interface'

export default abstract class ReceiveRepository {
  abstract createReceive(
    quoteId: string,
    receive: IBaseReceive
  ): Promise<IReceive>
}

export type ICreateReceiveOutput = IReceive
