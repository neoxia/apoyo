import { createTransport, Transporter } from 'nodemailer'
import { IMailerDriver, IPreparedMail, SendMailFailedException } from '@apoyo/mailer'

import { SES } from '@aws-sdk/client-ses'

export interface SesMailerConfig {
  region: string
  key?: string
  secret?: string
}

export class SesMailerDriver implements IMailerDriver {
  private readonly _transporter: Transporter

  constructor(config: SesMailerConfig) {
    const credentials =
      config.key && config.secret
        ? {
            accessKeyId: config.key,
            secretAccessKey: config.secret
          }
        : undefined

    const ses = new SES({
      apiVersion: '2010-12-01',
      region: config.region,
      credentials
    })

    // create Nodemailer SES transporter
    this._transporter = createTransport({
      SES: { ses }
    })
  }

  public async send(mail: IPreparedMail): Promise<void> {
    try {
      await this._transporter.sendMail(mail)
    } catch (err) {
      throw new SendMailFailedException(err)
    }
  }
}
