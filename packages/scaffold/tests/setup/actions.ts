import { AddAction, AppendAction, IScaffolderAction, PrependAction, Scaffolder } from '../../src'

export class HelloWorldAction implements IScaffolderAction {
  constructor(private readonly name: string) {}

  public async execute(parent: Scaffolder): Promise<void> {
    const app = parent.child({
      destination: parent.destination.cd('hello'),
      parameters: {
        name: this.name
      }
    })

    await app.execute([
      // Actions
      new AddAction({
        from: 'add-hello-world.ejs',
        to: `hello-<%= h.changeCase.paramCase(name) %>.ts`,
        skipIfExists: true
      }),
      new PrependAction({
        from: 'prepend-hello-world.ejs',
        to: `hello-<%= h.changeCase.paramCase(name) %>.ts`,
        before: 'console.log',
        skipIf: 'Before'
      }),
      new AppendAction({
        from: 'append-hello-world.ejs',
        to: `hello-<%= h.changeCase.paramCase(name) %>.ts`,
        after: 'console.log',
        skipIf: 'After'
      })
    ])
  }
}

export class CustomAction implements IScaffolderAction {
  public async execute(app: Scaffolder): Promise<void> {
    await app.execute([
      // Actions
      new HelloWorldAction('John'),
      new HelloWorldAction('Doe'),
      new HelloWorldAction('Smith')
    ])
  }
}
