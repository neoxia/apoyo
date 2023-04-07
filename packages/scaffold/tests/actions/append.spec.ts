import { AppendAction } from '../../src'
import { clear, scaffolder } from '../setup'

describe('AppendAction', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('execute', () => {
    it('should execute action correctly', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new AppendAction({
        from: 'append-hello-world.ejs',
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        after: `console.log('Hello <%= name %>')`,
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('Hello John');
        console.log('After');"
      `)
    })

    it('should execute action correctly with inline content', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new AppendAction({
        from: {
          content: `console.log('Goodbye <%= name %>');`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        after: `console.log('Hello <%= name %>')`,
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('Hello John');
        console.log('Goodbye John');"
      `)
    })

    it('should append at the end of the file without after property', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new AppendAction({
        from: {
          content: `console.log('Goodbye <%= name %>');`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('Hello John');
        console.log('Goodbye John');"
      `)
    })

    it('should skip action if content already exists', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new AppendAction({
        from: {
          content: `console.log('Hello <%= name %>');`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        skipIf: 'Hello <%= name %>',
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`"console.log('Hello John');"`)
    })
  })
})
