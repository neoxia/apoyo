import { Container, Injectable } from '../src'

describe('Injectable.of', () => {
  it('should create a constant', async () => {
    const $a = Injectable.of(1)

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Injectable.lazy', () => {
  it('should allow lazy import', async () => {
    const $a = Injectable.lazy(() => import('./utils/mocks').then((i) => i.$lazy))

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual('lazy')
    expect(b).toEqual('lazy')
  })
})
