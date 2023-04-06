import { IMailerDriver, IMail } from './contracts'

export interface MailerOptions {
  interceptor?(mail: IMail, send: (mail: IMail) => Promise<void>): Promise<void>
}

export class Mailer {
  constructor(private readonly options: MailerOptions, private readonly driver: IMailerDriver) {}

  public async send(mail: IMail): Promise<void> {
    if (!this.options.interceptor) {
      return this.driver.send(mail)
    }
    await this.options.interceptor(mail, (mail) => this.driver.send(mail))
  }
}
