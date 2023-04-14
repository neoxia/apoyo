import Mail, { Attachment as IAttachmentOptions, IcalAttachment as IIcalAttachmentOptions } from 'nodemailer/lib/mailer'

export class Address {
  constructor(public readonly email: string, public readonly name?: string) {}
}

export class View {
  constructor(public readonly view: string, public readonly data: Record<string, unknown> = {}) {}
}

export class FileAttachment {
  constructor(public readonly options: IAttachmentOptions) {}
}

export class IcalAttachment {
  constructor(public readonly options: IIcalAttachmentOptions) {}
}

export interface IEnvelope {
  /** The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>' */
  from?: Address

  /** Comma separated list or an array of recipients e-mail addresses that will appear on the To: field */
  to?: Address | Address[]

  /** Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field */
  cc?: Address | Address[]

  /** Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field */
  bcc?: Address | Address[]

  /** Comma separated list or an array of e-mail addresses that will appear on the Reply-To: field */
  replyTo?: Address | Address[]

  /** The subject of the e-mail */
  subject: string
}

export interface IContent {
  text?: View
  html?: View
  watch?: View
}

export interface IHeaders {
  /** optional Message-Id value, random value will be generated if not set */
  messageId?: string

  /** Message-id list (an array or space separated string) */
  references?: string | string[]

  /** An object or array of additional header fields */
  headers?: Record<string, string | string[]>
}

/**
 * Prepared nodemailer mail options
 */
export interface IPreparedMail extends Mail.Options {}
