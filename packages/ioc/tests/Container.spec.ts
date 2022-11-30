import { pipe, Prom, Result, Option, Exception } from '@apoyo/std'
import { Container, Provider, ShutdownPriority } from '../src'

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

    const $a = Provider.from(() => {
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

    const $a = Provider.from(() => {
      fn('a')
      return 1
    })
    const $b = Provider.from(() => {
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

    const $a = Provider.from(() => {
      fn('a')
      return 1
    })
    const $b = Provider.from(() => {
      fn('b')
      return 2
    })
    const $c = Provider.from(() => {
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

    const $a = Provider.from(() => {
      fn('a')
      return 1
    })
    const $b = Provider.from(() => {
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

  it('should be able to rebind providers', async () => {
    interface IRepository<T> {
      findAll: () => T[]
      findById: (id: string) => Option<T>
    }
    interface Todo {
      id: string
      title: string
    }

    interface ITodoRepository extends IRepository<Todo> {}

    const $todoRepository = Provider.from<ITodoRepository>(() => {
      throw new Exception('Not implemented')
    })

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

    const repository = await container.get($todoRepository)

    expect(typeof repository).toBe('object')
    expect(typeof repository.findAll).toBe('function')
    expect(repository.findAll()).toEqual([
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

    const $a = Provider.from(() => {
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

    const $a = Provider.from(() => {
      ++calls
      return calls
    })
    const $b = Provider.fromFactory((nb) => nb * 10, [$a])

    const scope = Container.create()

    const a = await scope.get($b)
    const b = await scope.get($b)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const $a = Provider.from(async () => {
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
    const calls: string[] = []

    const scope = Container.create()

    scope.on('close', {
      async close() {
        calls.push('db')
      },
      priority: ShutdownPriority.LOW
    })

    scope.on('close', {
      async close() {
        calls.push('http')
      },
      priority: ShutdownPriority.HIGH
    })

    // No close methods should have been called yet.
    expect(calls).toEqual([])

    await scope.close()

    // Should first stop HTTP server (because of higher priority setting), then stop the DB.
    expect(calls).toEqual(['http', 'db'])
  })

  it('should throw when used after closing', async () => {
    const $a = Provider.fromConst(1)

    const scope = Container.create()

    await scope.close()

    const result = await pipe(scope.get($a), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })
})
