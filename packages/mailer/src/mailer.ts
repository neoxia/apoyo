import { Arr, Option, pipe } from '@apoyo/std'
import { IMail, IMailerDriver } from './contracts'
import { ITemplateEngine } from './template-engine'
import { Address, IPreparedMail, View } from './types'

export interface MailerConfig {
  from?: Address
  globals?: Record<string, unknown>
  interceptor?(prepared: IPreparedMail, send: (prepared: IPreparedMail) => Promise<void>): Promise<void>
}

export class Mailer {
  constructor(
    private readonly config: MailerConfig,
    private readonly driver: IMailerDriver,
    private readonly renderer: ITemplateEngine
  ) {}

  public child(config: Partial<MailerConfig>) {
    return new Mailer(
      {
        from: config.from ?? this.config.from,
        globals: {
          ...this.config.globals,
          ...config.globals
        },
        interceptor: config.interceptor ?? this.config?.interceptor
      },
      this.driver,
      this.renderer
    )
  }

  public async prepare(mail: IMail): Promise<IPreparedMail> {
    const envelope = mail.envelope()
    const content = mail.content()
    const headers = mail.headers?.()
    const attachments = pipe(mail.attachments?.(), Option.map(Arr.map((attachment) => attachment.options)))
    const icalEvent = pipe(
      mail.ical?.(),
      Option.map((ical) => ical.options)
    )

    return {
      ...envelope,
      ...headers,
      from: envelope.from ?? this.config.from,
      text: await pipe(
        content.text,
        Option.map((view) => this._render(view))
      ),
      html: await pipe(
        content.html,
        Option.map((view) => this._render(view))
      ),
      watchHtml: await pipe(
        content.watch,
        Option.map((view) => this._render(view))
      ),
      attachments,
      icalEvent
    }
  }

  public async send(mail: IMail): Promise<void> {
    const prepared = await this.prepare(mail)
    if (!this.config.interceptor) {
      return this.driver.send(prepared)
    }
    await this.config.interceptor(prepared, (prepared) => this.driver.send(prepared))
  }

  private async _render(view: View) {
    const viewPath = view.view.replace(/\./g, '/')
    return this.renderer.renderFile(viewPath, {
      ...this.config?.globals,
      ...view.data
    })
  }
}