import { Arr, Dict, Option, pipe } from '@apoyo/std'
import { IMail, IMailDriver } from './contracts'
import { ITemplateEngine } from './template-engine'
import { Address, IPreparedMail, View } from './types'

import Mail from 'nodemailer/lib/mailer'

export interface MailerConfig {
  from?: Address
  globals?: Record<string, unknown>
  driver: IMailDriver
  renderer: ITemplateEngine
}

export class Mailer {
  private readonly driver: IMailDriver
  private readonly renderer: ITemplateEngine

  constructor(private readonly config: MailerConfig) {
    this.driver = config.driver
    this.renderer = config.renderer
  }

  public child(config: Partial<MailerConfig>) {
    return new Mailer({
      from: config.from ?? this.config.from,
      globals: {
        ...this.config.globals,
        ...config.globals
      },
      driver: config.driver ?? this.config.driver,
      renderer: config.renderer ?? this.config.renderer
    })
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

    // TODO: fix Obj.compact
    return Dict.compact({
      ...headers,
      from: pipe(envelope.from ?? this.config.from, Option.map(Mailer._transformAddress)),
      to: pipe(envelope.to, Option.map(Mailer._transformAddresses)),
      cc: pipe(envelope.cc, Option.map(Mailer._transformAddresses)),
      bcc: pipe(envelope.bcc, Option.map(Mailer._transformAddresses)),
      replyTo: pipe(envelope.replyTo, Option.map(Mailer._transformAddresses)),
      subject: envelope.subject,
      text: await pipe(
        content.text,
        Option.map((view) => this._render(view, mail))
      ),
      html: await pipe(
        content.html,
        Option.map((view) => this._render(view, mail))
      ),
      watchHtml: await pipe(
        content.watch,
        Option.map((view) => this._render(view, mail))
      ),
      attachments,
      icalEvent
    })
  }

  public async send(mail: IMail): Promise<void> {
    const prepared = await this.prepare(mail)
    await this.driver.send(prepared)
  }

  private async _render(view: View, mail: IMail) {
    return this.renderer.renderFile(view.name, {
      ...this.config?.globals,
      ...mail
    })
  }

  private static _transformAddress(address: Address): string | Mail.Address {
    if (!address.name) {
      return address.email
    }
    return {
      address: address.email,
      name: address.name
    }
  }

  private static _transformAddresses(addresses: Address | Address[]): (string | Mail.Address)[] {
    if (!Array.isArray(addresses)) {
      return [Mailer._transformAddress(addresses)]
    }
    return addresses.map((address) => Mailer._transformAddress(address))
  }
}
