import { pipe, Prom, Result, Option } from '@apoyo/std'
import { Container, Injectable, Resource } from '../src'

describe('Container.create', () => {
  it('should build and return container', () => {
    const container = new Container()

    expect(typeof container.get).toEqual('function')
    expect(typeof container.close).toEqual('function')
  })
})

describe('Container.bind', () => {
  it('should bind a Injectable to a constant value', async () => {
    const fn = jest.fn()

    const $a = Injectable.define(() => {
      fn('a')
      return 1
    })

    const bindings = [Container.bind($a, 2)]
    const container = Container.create({
      bindings
    })

    const a = await container.get($a)

    expect(fn).toHaveBeenCalledTimes(0)

    expect(a).toBe(2)
  })

  it('should bind a Injectable to another Injectable', async () => {
    const fn = jest.fn()

    const $a = Injectable.define(() => {
      fn('a')
      return 1
    })
    const $b = Injectable.define(() => {
      fn('b')
      return 2
    })

    const bindings = [Container.bind($a, $b)]
    const container = Container.create({
      bindings
    })

    const a = await container.get($a)
    const b = await container.get($b)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenNthCalledWith(1, 'b')

    expect(a).toBe(2)
    expect(b).toBe(2)
  })

  it('should resolve deeply', async () => {
    const fn = jest.fn()

    const $a = Injectable.define(() => {
      fn('a')
      return 1
    })
    const $b = Injectable.define(() => {
      fn('b')
      return 2
    })
    const $c = Injectable.define(() => {
      fn('c')
      return 3
    })

    const bindings = [Container.bind($b, $c), Container.bind($a, $b)]
    const container = Container.create({
      bindings
    })

    const a = await container.get($a)
    const b = await container.get($b)
    const c = await container.get($c)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenNthCalledWith(1, 'c')

    expect(a).toBe(3)
    expect(b).toBe(3)
    expect(c).toBe(3)
  })

  it('should resolve correctly with injectables and constants', async () => {
    const fn = jest.fn()

    const $a = Injectable.define(() => {
      fn('a')
      return 1
    })
    const $b = Injectable.define(() => {
      fn('b')
      return 2
    })

    const bindings = [Container.bind($b, 10), Container.bind($a, $b)]
    const container = Container.create({
      bindings
    })

    const a = await container.get($a)
    const b = await container.get($b)

    expect(fn).toHaveBeenCalledTimes(0)

    expect(a).toBe(10)
    expect(b).toBe(10)
  })

  it('should be able to rebind abstract vars', async () => {
    interface IRepository<T> {
      findAll: () => T[]
      findById: (id: string) => Option<T>
    }
    interface Todo {
      id: string
      title: string
    }

    interface ITodoRepository extends IRepository<Todo> {}

    const $todoRepository = Injectable.abstract<ITodoRepository>('ITodoRepository')

    const $findAll = Injectable.define([$todoRepository], (repo) => repo.findAll)

    const mockRepository: ITodoRepository = {
      findAll: () => [
        {
          id: 'xxxx',
          title: 'Wake up'
        }
      ],
      findById: () => undefined
    }

    const container = Container.create({
      bindings: [Container.bind($todoRepository, mockRepository)]
    })

    const findAll = await container.get($findAll)

    expect(typeof findAll).toBe('function')
    expect(findAll()).toEqual([
      {
        id: 'xxxx',
        title: 'Wake up'
      }
    ])
  })
})

describe('Container.get', () => {
  it('should load and get the variable once', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      ++calls
      return calls
    })

    const scope = Container.create()

    const a = await scope.get($a)
    const b = await scope.get($a)

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })

  it('should work with injectables having dependencies', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      ++calls
      return calls
    })
    const $b = Injectable.define([$a], (nb) => nb * 10)

    const scope = Container.create()

    const a = await scope.get($b)
    const b = await scope.get($b)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const $a = Injectable.define(async () => {
      ++calls
      await Prom.sleep(200)
      return calls
    })

    const scope = Container.create()

    const pA = scope.get($a)
    const pB = scope.get($a)

    const a = await pA
    const b = await pB

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

describe('Container.close', () => {
  it('should close correctly', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      return Resource.of(10, () => {
        ++calls
      })
    })

    const scope = Container.create()
    const value = await scope.get($a)

    expect(value).toBe(10)
    expect(calls).toBe(0)

    await scope.close()

    expect(calls).toBe(1)
  })

  it('should throw when used after closing', async () => {
    const $a = Injectable.of(1)

    const scope = Container.create()

    await scope.close()

    const result = await pipe(scope.get($a), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })
})
