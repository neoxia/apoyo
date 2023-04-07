import { IMailerDriver, IMail } from './contracts'
import { ITemplateEngine } from './template-engine'

export interface MailerOptions {
  interceptor?(mail: IMail, send: (mail: IMail) => Promise<void>): Promise<void>
  parameters?: Record<string, unknown>
}

export class Mailer {
  constructor(
    private readonly options: MailerOptions,
    private readonly driver: IMailerDriver,
    private readonly renderer: ITemplateEngine
  ) {}

  public async send(mail: IMail): Promise<void> {
    if (!this.options.interceptor) {
      return this.driver.send(mail)
    }
    await this.options.interceptor(mail, (mail) => this.driver.send(mail))
  }

  public async renderFile(content: string, parameters?: Record<string, unknown>) {
    return this.renderer.render(content, {
      ...this.options?.parameters,
      ...parameters
    })
  }

  public async render(content: string, parameters?: Record<string, unknown>) {
    return this.renderer.render(content, {
      ...this.options?.parameters,
      ...parameters
    })
  }
}
