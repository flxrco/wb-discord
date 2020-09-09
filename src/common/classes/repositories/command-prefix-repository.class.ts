import { Observable } from 'rxjs'

export default abstract class CommandPrefixRepository {
  abstract getGuildPrefix$(id: string): Observable<string>

  async getGuildPrefix(id: string) {
    return await this.getGuildPrefix$(id).toPromise()
  }
}
