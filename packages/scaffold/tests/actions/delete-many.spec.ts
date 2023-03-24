import { DeleteManyAction } from '../../src'
import { clear, scaffolder } from './setup'

describe('DeleteManyAction', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('execute', () => {
    it('should execute action correctly', async () => {
      await scaffolder.destination.write('hello-john.ts', `console.log('Hello John');`)

      const action = new DeleteManyAction({
        patterns: ['hello-john.ts']
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.exists('hello-john.ts')).toBe(false)
    })

    it('should delete multiple by glob pattern correctly', async () => {
      await scaffolder.destination.write('hello/hello-john.ts', `console.log('Hello John');`)
      await scaffolder.destination.write('hello/hello-doe.ts', `console.log('Hello Doe');`)

      const action = new DeleteManyAction({
        patterns: ['hello/*.ts']
      })

      await action.execute(scaffolder)

      expect(await scaffolder.destination.exists('hello/hello-john.ts')).toBe(false)
      expect(await scaffolder.destination.exists('hello/hello-john.ts')).toBe(false)
    })
  })
})
