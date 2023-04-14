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

```ts
// 1. Create mailer

import { Mailer, EjsTemplateEngine, Address } from '@apoyo/mailer'
import { SesDriver } from '@apoyo/mailer-ses'

const platformConfig = {
  routes: {
    home() {
      return 'localhost:8080'
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
  from: new Address('no-reply@myapp.com', 'My App'),
  globals: {
    platform: platformConfig
  },
  driver,
  renderer,
})


// 2. Define email

import { Address, View, IMail } from '@apoyo/mailer'

export class ConfirmAccountMail implements IMail {
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

// 3. Send out email using a mailer instance

await mailer.send(new ConfirmAccountMail(user))
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
