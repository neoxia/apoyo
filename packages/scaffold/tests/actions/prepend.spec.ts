import { PrependAction } from '../../src'
import { clear, scaffolder } from '../setup'

describe('PrependAction', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('execute', () => {
    it('should execute action correctly', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new PrependAction({
        from: 'prepend-hello-world.ejs',
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        before: `console.log('Hello <%= name %>')`,
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('Before');
        console.log('Hello John');"
      `)
    })

    it('should execute action correctly with inline content', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new PrependAction({
        from: {
          content: `console.log('<%= name %> enters the house');`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        before: `console.log('Hello <%= name %>')`,
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('John enters the house');
        console.log('Hello John');"
      `)
    })

    it('should prepend at the top of the file without before property', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new PrependAction({
        from: {
          content: `console.log('<%= name %> enters the house');`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`
        "console.log('John enters the house');
        console.log('Hello John');"
      `)
    })

    it('should skip action if content already exists', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new PrependAction({
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
