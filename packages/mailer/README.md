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
// Define email

export class ConfirmUserMail implements IMail {
  constructor(private readonly user: User) {}

  public async envelope() {
    return {
      to: new Address(this.user.email, this.user.displayName),
      subject: 'Confirm user sign-up'
    }
  }

  public async content() {
    return {
      html: new View('users.confirm-user', { user: this.user }),
      text: new View('users.confirm-user-text', { user: this.user })
    }
  }
}

// Send out email using a mailer instance

await mailer.send(new ConfirmUserMail(user))
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
