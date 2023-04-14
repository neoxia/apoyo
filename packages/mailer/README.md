# Apoyo - Mailer

[![npm version](https://badgen.net/npm/v/@apoyo/mailer)](https://www.npmjs.com/package/@apoyo/mailer)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/mailer`

## Documentation

The `mailer` package series contains different drivers and abstractions for mailing.

A more complete documentation will be made available once the API has stabilized itself.

## Example

1. Create mailer

```ts
import { Mailer, EjsTemplateEngine, Address } from '@apoyo/mailer'
import { SesDriver } from '@apoyo/mailer-ses'

const platformUrl = 'localhost:8080'
const platformConfig = {
  routes: {
    confirmAccount(token: string) {
      return `${platformUrl}/account/confirm?${encodeURIComponent(token)}`
    }
  }
}

const driver = new SesDriver({
  region: 'eu-west-1'
})

const renderer = new EjsTemplateEngine({
  rootDir: path.resolve(__dirname, './assets/emails'),
})

const mailer = new Mailer({
  from: new Address('no-reply@myapp.com', 'MyApp'),
  globals: {
    platform: platformConfig
  },
  driver,
  renderer,
})
```

2. Define mail

```ts
import { Address, View, IMail } from '@apoyo/mailer'

export class ConfirmAccountMail implements IMail {
  constructor(public readonly user: User, public readonly confirmToken: string) {}

  public envelope() {
    return {
      to: new Address(this.user.email, this.user.displayName),
      subject: 'Confirm user sign-up'
    }
  }

  public content() {
    return {
      html: new View('users/confirm-account'),
      text: new View('users/confirm-account-text')
    }
  }
}
```

3. Define mail template

```html
Hello <%= user.displayName %>,

Please confirm your account by clicking on the link below:

<a href="<%= platform.routes.confirmAccount(confirmToken) %>">Confirm account</a>

Regards,

MyApp
```

4. Send out email using a mailer instance

```ts
await mailer.send(new ConfirmAccountMail(user, 'my-confirmation-token'))
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
