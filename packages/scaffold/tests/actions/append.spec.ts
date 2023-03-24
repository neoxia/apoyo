import { AppendAction } from '../../src'
import { clear, scaffolder } from './setup'

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
  })
})
