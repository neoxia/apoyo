import path from 'path'
import { EjsTemplateEngine } from '../src'

describe('EjsTemplateEngine', () => {
  const platform = {
    routes: {
      confirmAccount(token: string) {
        return `http://localhost:8080/account/confirm?${encodeURIComponent(token)}`
      }
    }
  }

  const renderer = new EjsTemplateEngine({
    rootDir: path.resolve(__dirname, 'assets', 'emails')
  })

  describe('renderFile', () => {
    it('should render file correctly', async () => {
      const text = await renderer.renderFile('confirm-account', {
        user: {
          firstName: 'John',
          lastName: 'Doe'
        },
        confirmToken: 'my-token',
        platform
      })

      expect(text).toMatchInlineSnapshot(`
        "Hello John Doe,

        Please confirm your account by clicking on the link below:

        <a href=\\"http://localhost:8080/account/confirm?my-token\\">Confirm account</a>

        Regards,

        MyApp"
      `)
    })

    it('should render file correctly with includes', async () => {
      const text = await renderer.renderFile('confirm-account-with-footer', {
        user: {
          firstName: 'John',
          lastName: 'Doe'
        },
        confirmToken: 'my-token',
        platform
      })

      expect(text).toMatchInlineSnapshot(`
        "Hello John Doe,

        Please confirm your account by clicking on the link below:

        <a href=\\"http://localhost:8080/account/confirm?my-token\\">Confirm account</a>

        Regards,

        MyApp"
      `)
    })
  })
})
