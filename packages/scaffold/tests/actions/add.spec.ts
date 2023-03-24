import { AddAction } from '../../src'
import { clear, scaffolder } from './setup'

describe('AddAction', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('execute', () => {
    it('should execute action correctly', async () => {
      const action = new AddAction({
        from: 'add-hello-world.ejs',
        to: 'hello-world.ts',
        parameters: {
          name: 'John Doe'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-world.ts')).toMatchInlineSnapshot(
        `"console.log('Hello John Doe');"`
      )
    })

    it('should allow dynamic destination path', async () => {
      const action = new AddAction({
        from: 'add-hello-world.ejs',
        to: 'hello-world/<%= h.changeCase.paramCase(name) %>.ts',
        parameters: {
          name: 'John Doe'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-world/john-doe.ts')).toMatchInlineSnapshot(
        `"console.log('Hello John Doe');"`
      )
    })

    it('should skip file if already exists', async () => {
      await scaffolder.destination.write('hello-world.ts', `console.log('Hello world');`)

      const action = new AddAction({
        from: 'add-hello-world.ejs',
        to: 'hello-world.ts',
        skipIfExists: true,
        parameters: {
          name: 'John Doe'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-world.ts')).toMatchInlineSnapshot(`"console.log('Hello world');"`)
    })
  })
})
