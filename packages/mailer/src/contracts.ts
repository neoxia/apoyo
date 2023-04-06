import { Options } from 'nodemailer/lib/mailer'

export interface IMail extends Options {}

export {
  Address as IMailAddress,
  Attachment as IMailAttachment,
  IcalAttachment as IMailIcalAttachment
} from 'nodemailer/lib/mailer'

export interface IMailerDriver {
  send(mail: IMail): Promise<void>
}
