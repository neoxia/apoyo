import { ReplaceAction } from '../../src'
import { clear, scaffolder } from '../setup'

describe('AppendAction', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('execute', () => {
    it('should execute action correctly with inline content', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new ReplaceAction({
        from: {
          content: `Goodbye`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        replace: `Hello`,
        parameters: {
          name: 'John'
        }
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.get('hello-john.ts')).toMatchInlineSnapshot(`"console.log('Goodbye John');"`)
    })

    it('should skip action if content already exists', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new ReplaceAction({
        from: {
          content: `Goodbye`
        },
        to: 'hello-<%= h.changeCase.paramCase(name) %>.ts',
        replace: 'Hello',
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
