import { IMailDriver } from '../contracts'
import { IPreparedMail } from '../types'

export class FakeDriver implements IMailDriver {
  public async send(_mail: IPreparedMail): Promise<void> {
    return
  }
}
