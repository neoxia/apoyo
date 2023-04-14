import path from 'path'
import {
  Address,
  EjsTemplateEngine,
  IContent,
  IEnvelope,
  IMail,
  IMailerDriver,
  ITemplateEngine,
  Mailer,
  View
} from '../src'

export interface User {
  email: string
  firstName: string
  lastName: string
}

export class ConfirmAccountMail implements IMail {
  constructor(public readonly user: User, public readonly confirmToken: string) {}

  envelope(): IEnvelope {
    return {
      subject: 'Confirm account',
      to: new Address(this.user.email)
    }
  }
  content(): IContent {
    return {
      html: new View('users/confirm-account')
    }
  }
}

describe('Mailer', () => {
  let driver: IMailerDriver
  let renderer: ITemplateEngine
  let mailer: Mailer

  beforeEach(() => {
    const platform = {
      routes: {
        confirmAccount(token: string) {
          return `http://localhost:8080/account/confirm?${encodeURIComponent(token)}`
        }
      }
    }

    driver = {
      send: jest.fn().mockResolvedValue(undefined)
    }

    renderer = new EjsTemplateEngine({
      rootDir: path.resolve(__dirname, 'assets', 'emails')
    })

    mailer = new Mailer(
      {
        from: new Address('no-reply@my-app.com', 'My App'),
        globals: {
          platform
        }
      },
      driver,
      renderer
    )
  })

  describe('prepare', () => {
    it('should prepare mail correctly', async () => {
      const user: User = {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
      const mail = new ConfirmAccountMail(user, 'my-confirmation-token')

      const prepared = await mailer.prepare(mail)

      expect(prepared).toEqual({
        to: [user.email],
        from: {
          address: 'no-reply@my-app.com',
          name: 'My App'
        },
        subject: 'Confirm account',
        html: expect.any(String)
      })

      expect(prepared.html).toMatchInlineSnapshot(`
        "Hello John Doe,

        Please confirm your account by clicking on the link below:

        <a href=\\"http://localhost:8080/account/confirm?my-confirmation-token\\">Confirm account</a>

        Regards,

        MyApp"
      `)
    })
  })

  describe('send', () => {
    it('should send mail with driver', async () => {
      const user: User = {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
      const mail = new ConfirmAccountMail(user, 'my-confirmation-token')

      const mock = jest.spyOn(driver, 'send').mockResolvedValue()

      await mailer.send(mail)

      expect(mock.mock.calls[0][0]).toEqual({
        to: [user.email],
        from: {
          address: 'no-reply@my-app.com',
          name: 'My App'
        },
        subject: 'Confirm account',
        html: expect.any(String)
      })
    })
  })
})
