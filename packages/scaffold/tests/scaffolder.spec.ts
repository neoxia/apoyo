import { clear, scaffolder } from './setup'
import { CustomAction } from './setup/actions'

describe('Scaffolder', () => {
  describe('child', () => {
    it.todo('should create child instance')
  })

  describe('render', () => {
    it.todo('should render content with appropriate parameters')
  })

  describe('execute', () => {
    it.todo('should execute all listed actions correctly')
  })
})

describe('Scaffolder (integration)', () => {
  beforeEach(clear)
  afterEach(clear)

  describe('CustomAction', () => {
    it('should execute CustomAction correctly', async () => {
      await scaffolder.execute([new CustomAction()])

      expect(scaffolder.destination.exists('hello/hello-doe.ts')).toBeTruthy()
      expect(scaffolder.destination.exists('hello/hello-john.ts')).toBeTruthy()
      expect(scaffolder.destination.exists('hello/hello-smith.ts')).toBeTruthy()
    })
  })
})
