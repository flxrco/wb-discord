export default class MentionUtils {
  private static IS_USER_MENTION_PATTERN = /^<@!?(\d{17,19})>$/
  private static HAS_USER_MENTION_PATTERN = /<@!?(\d{17,19})>/

  /**
   * Extacts the snowflake from the user mention string, if any was found.
   * @param input A string that possibly contains a single mention. This will be trimmed in both sides
   *   in the process. If the sting has multiple mentions, the function will return undefined.
   * @returns A string containing the snowflake if the string is a mention,
   *   else returns undefined.
   */
  static extractUserSnowflake(input: string): string {
    const trimmed = input.trim()
    const { IS_USER_MENTION_PATTERN: regexp } = this
    if (!regexp.test(trimmed)) {
      return undefined
    }

    return regexp.exec(trimmed)[1]
  }

  /**
   * Checks if a string has a user mention in it.
   * @param input A string which possible contains a mention substring. May
   *   contain possible mentions.
   * @returns True if a mention was found, false if otherwise.
   */
  static hasUserMention(input: string): boolean {
    return this.HAS_USER_MENTION_PATTERN.test(input)
  }

  /**
   * Checks if the given string is a user mention.
   * @param input A string possibly containing a user mention. If multiple mentions
   *   were found, false will be returned.
   * @returns True if a single mention was found, false if none or many.
   */
  static isUserMention(input: string): boolean {
    return !!this.extractUserSnowflake(input)
  }
}
