import { FileAttachment, IcalAttachment, IContent, IEnvelope, IHeaders, IPreparedMail } from './types'

export interface IMail {
  envelope(): IEnvelope
  content(): IContent
  headers?(): IHeaders
  ical?(): IcalAttachment
  attachments?(): FileAttachment[]
}

export interface IMailDriver {
  send(mail: IPreparedMail): Promise<void>
}
