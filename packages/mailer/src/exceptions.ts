import { Exception } from '@apoyo/std'

export class SendMailFailedException extends Exception {
  public readonly code = 'E_SEND_MAIL_FAILED'
  constructor(cause: Error) {
    super('Mail could not be send', cause)
  }
}
