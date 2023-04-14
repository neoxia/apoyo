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

```ts
// Create mailer

import { Mailer, EjsTemplateEngine, Address } from '@apoyo/mailer'
import { SesDriver } from '@apoyo/mailer-ses'

const driver = new SesDriver({
  region: 'eu-west-1'
})

const renderer = new EjsTemplateEngine({
  rootDir: path.resolve(__dirname, './assets/mails'),
})

const mailer = new Mailer({
  from: new Address('no-reply@myapp.com', 'My App'),
  globals: {
    platform: {
      baseUrl: 'localhost:8080'
    }
  }
}, driver, renderer)


// Define email

import { Address, View, IMail } from '@apoyo/mailer'

export class ConfirmUserMail implements IMail {
  constructor(public readonly user: User) {}

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

// Send out email using a mailer instance

await mailer.send(new ConfirmUserMail(user))
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
