export default interface IReceive extends IBaseReceive {
  receiveId: string
}

export interface IBaseReceive {
  receiverId: string
  receiveDt: Date

  serverId: string
  channelId: string
  messageId: string
}
