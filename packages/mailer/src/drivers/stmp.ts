import { createTransport, Transporter } from 'nodemailer'
import { IMailerDriver } from '../contracts'
import { SendMailFailedException } from '../exceptions'
import { IPreparedMail } from '../types'

export interface StmpMailerConfig {
  /** the hostname or IP address to connect to (defaults to ‘localhost’) */
  host: string

  /** the port to connect to (defaults to 25 or 465) */
  port: number

  username: string

  password: string

  /** defines if the connection should use SSL (if true) or not (if false) */
  ssl?: boolean
}

export class StmpMailerDriver implements IMailerDriver {
  private readonly _transporter: Transporter

  constructor(config: StmpMailerConfig) {
    this._transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.ssl ?? false,
      auth: {
        user: config.username,
        pass: config.password
      }
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
