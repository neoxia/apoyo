import { Abstract, Container } from '../src'

describe('Abstract.create', () => {
  it('should throw by default', async () => {
    const $diskStrategy = Abstract.create<{ type: 'aws' | 'azure' }>('DiskStrategy')

    const container = Container.create()

    expect(container.get($diskStrategy)).rejects.toThrow()
  })

  it('should get bound value', async () => {
    const $diskStrategy = Abstract.create<{ type: 'aws' | 'azure' }>('DiskStrategy')

    const container = Container.create({
      bindings: [
        Container.bind($diskStrategy, {
          type: 'aws'
        })
      ]
    })

    expect(container.get($diskStrategy)).resolves.toEqual({
      type: 'aws'
    })
  })
})
