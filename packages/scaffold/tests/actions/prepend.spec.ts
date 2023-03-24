import { PrependAction } from '../../src'
import { clear, scaffolder } from './setup'

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
  })
})
