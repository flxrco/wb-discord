export default abstract class QuoteEpxirationRepository {
  abstract computeExpirationDate(
    guildId: string,
    channelId: string
  ): Promise<Date>
}
