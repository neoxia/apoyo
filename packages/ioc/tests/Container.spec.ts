import { Prom, Exception } from '@apoyo/std'
import { Container, ContainerClosedException, Provider, ShutdownPriority } from '../src'

describe('Container.create', () => {
  it('should build and return container', () => {
    const container = new Container()

    expect(typeof container.get).toEqual('function')
    expect(typeof container.close).toEqual('function')
  })
})

describe('Container.bind', () => {
  it('should bind a Injectable to a constant value', async () => {
    const fn = jest.fn(() => 1)

    class MyModule {
      static A = Provider.fromFactory(fn, [])
    }

    const bindings = [Container.bind(MyModule.A, 2)]
    const container = Container.create({
      bindings
    })

    const a = await container.get(MyModule.A)

    expect(fn).toHaveBeenCalledTimes(0)

    expect(a).toBe(2)
  })

  it('should bind a Injectable to another Injectable', async () => {
    const fnA = jest.fn(() => 1)
    const fnB = jest.fn(() => 2)

    class MyModule {
      static A = Provider.fromFactory(fnA, [])
    }
    class MyModuleMock {
      static B = Provider.fromFactory(fnB, [])
    }

    const bindings = [Container.bind(MyModule.A, MyModuleMock.B)]
    const container = Container.create({
      bindings
    })

    // Should use MyModuleMock.B
    const a = await container.get(MyModule.A)

    // Should not re-create MyModuleMock.B a second time
    const b = await container.get(MyModuleMock.B)

    expect(fnA).toHaveBeenCalledTimes(0)
    expect(fnB).toHaveBeenCalledTimes(1)

    expect(a).toBe(2)
    expect(b).toBe(2)
  })

  it('should resolve deeply', async () => {
    const fnA = jest.fn(() => 1)
    const fnB = jest.fn(() => 2)
    const fnC = jest.fn(() => 3)

    class MyModule {
      static A = Provider.fromFactory(fnA, [])
      static B = Provider.fromFactory(fnB, [])
      static C = Provider.fromFactory(fnC, [])
    }

    const bindings = [Container.bind(MyModule.B, MyModule.C), Container.bind(MyModule.A, MyModule.B)]
    const container = Container.create({
      bindings
    })

    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)
    const c = await container.get(MyModule.C)

    expect(fnA).toHaveBeenCalledTimes(0)
    expect(fnB).toHaveBeenCalledTimes(0)
    expect(fnC).toHaveBeenCalledTimes(1)

    expect(a).toBe(3)
    expect(b).toBe(3)
    expect(c).toBe(3)
  })

  it('should resolve correctly with injectables and constants', async () => {
    const fnA = jest.fn(() => 1)
    const fnB = jest.fn(() => 2)

    class MyModule {
      static A = Provider.fromFactory(fnA, [])
      static B = Provider.fromFactory(fnB, [])
    }

    const bindings = [Container.bind(MyModule.B, 10), Container.bind(MyModule.A, MyModule.B)]
    const container = Container.create({
      bindings
    })

    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)

    expect(fnA).toHaveBeenCalledTimes(0)
    expect(fnB).toHaveBeenCalledTimes(0)

    expect(a).toBe(10)
    expect(b).toBe(10)
  })

  it('should be able to rebind providers', async () => {
    interface IRepository<T> {
      findAll: () => T[]
      findById: (id: string) => T | null
    }
    interface Todo {
      id: string
      title: string
    }

    interface ITodoRepository extends IRepository<Todo> {}

    class MyModule {
      static TODO_REPOSITORY = Provider.from<ITodoRepository>(() => {
        throw new Exception('Not implemented')
      })
    }

    const mockRepository: ITodoRepository = {
      findAll: () => [
        {
          id: 'xxxx',
          title: 'Wake up'
        }
      ],
      findById: () => null
    }

    const container = Container.create({
      bindings: [Container.bind(MyModule.TODO_REPOSITORY, mockRepository)]
    })

    const repository = await container.get(MyModule.TODO_REPOSITORY)

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
    const fn = jest.fn(() => 1)

    class MyModule {
      static A = Provider.fromFactory(fn, [])
    }

    const container = Container.create()

    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.A)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })

  it('should work with injectables having dependencies', async () => {
    const fn = jest.fn(() => 1)

    class MyModule {
      static A = Provider.fromFactory(fn, [])
      static B = Provider.fromFactory((nb) => nb * 10, [MyModule.A])
    }

    const container = Container.create()

    const a = await container.get(MyModule.B)
    const b = await container.get(MyModule.B)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(a).toBe(10)
    expect(b).toBe(10)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    const fn = jest.fn(async () => {
      await Prom.sleep(200)
      return 1
    })

    class MyModule {
      static A = Provider.fromFactory(fn, [])
    }

    const container = Container.create()

    const pA = container.get(MyModule.A)
    const pB = container.get(MyModule.A)

    const a = await pA
    const b = await pB

    expect(fn).toHaveBeenCalledTimes(1)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

describe('Container.close', () => {
  it('should close correctly', async () => {
    const calls: string[] = []

    const container = Container.create()

    container.on('close', {
      async close() {
        calls.push('db')
      },
      priority: ShutdownPriority.LOW
    })

    container.on('close', {
      async close() {
        calls.push('http')
      },
      priority: ShutdownPriority.HIGH
    })

    // No close methods should have been called yet.
    expect(calls).toEqual([])

    await container.close()

    // Should first stop HTTP server (because of higher priority setting), then stop the DB.
    expect(calls).toEqual(['http', 'db'])
  })

  it('should throw when used after closing', async () => {
    class MyModule {
      static A = Provider.fromConst(1)
    }

    const container = Container.create()

    await container.close()

    await expect(container.get(MyModule.A)).rejects.toThrow(ContainerClosedException)
  })
})
