import { pipe, Prom, Result, Option } from '@apoyo/std'
import { Resource, Scope, Injectable } from '../src'
import { SCOPE_INTERNAL } from '../src/scopes/symbols'

describe('Scope.create', () => {
  it('should build and return scope', () => {
    const scope = Scope.create()

    expect(scope[SCOPE_INTERNAL]).toBeDefined()
    expect(scope.parent).toEqual(undefined)
    expect(typeof scope.get).toEqual('function')
    expect(typeof scope.close).toEqual('function')

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
  })
})

describe('Scope.factory', () => {
  it('should create scope factory to create scope with parent context', async () => {
    const root = Scope.create()
    const factory = root.factory()
    const childScope = factory.create()

    expect(childScope.parent?.scope).toEqual(root)
  })
})

describe('Scope.run', () => {
  it('should run given variable and return result', async () => {
    let unmountCalls = 0

    const $main = Injectable.define(() => {
      return Resource.of(10, () => {
        ++unmountCalls
      })
    })

    const value = await Scope.run($main)

    expect(value).toBe(10)
    expect(unmountCalls).toBe(1)
  })

  it('should also close on error', async () => {
    let unmountCalls = 0

    const $db = Injectable.define(() => {
      const db = {
        close: async () => {
          await Prom.sleep(100)
          ++unmountCalls
        }
      }
      return Resource.of(db, () => db.close())
    })

    const $main = Injectable.define($db, () => {
      throw new Error('expected')
    })

    const result = await pipe(Scope.run($main), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
    expect(unmountCalls).toBe(1)
  })
})

describe('Scope.bind', () => {
  it('should bind a Injectable to a constant value', async () => {
    const calls: string[] = []
    const $a = Injectable.define(() => {
      calls.push('a')
      return 1
    })

    const bindings = [Scope.bind($a, 2)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]
    expect(internal.bindings.size).toBe(1)

    const a = await scope.get($a)

    expect(calls).toEqual([])
    expect(a).toBe(2)
  })

  it('should bind a Injectable to another Injectable', async () => {
    const calls: string[] = []
    const $a = Injectable.define(() => {
      calls.push('a')
      return 1
    })
    const $b = Injectable.define(() => {
      calls.push('b')
      return 2
    })

    const bindings = [Scope.bind($a, $b)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(1)

    const a = await scope.get($a)
    const b = await scope.get($b)

    expect(calls).toEqual(['b'])
    expect(a).toBe(2)
    expect(b).toBe(2)
  })

  it('should resolve deeply', async () => {
    const calls: string[] = []
    const $a = Injectable.define(() => {
      calls.push('a')
      return 1
    })
    const $b = Injectable.define(() => {
      calls.push('b')
      return 2
    })
    const $c = Injectable.define(() => {
      calls.push('c')
      return 3
    })

    const bindings = [Scope.bind($b, $c), Scope.bind($a, $b)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(2)

    const a = await scope.get($a)
    const b = await scope.get($b)
    const c = await scope.get($c)

    expect(calls).toEqual(['c'])
    expect(a).toBe(3)
    expect(b).toBe(3)
    expect(c).toBe(3)
  })

  it('should resolve correctly with Vars and constants', async () => {
    const calls: string[] = []
    const $a = Injectable.define(() => {
      calls.push('a')
      return 1
    })
    const $b = Injectable.define(() => {
      calls.push('b')
      return 2
    })

    const bindings = [Scope.bind($b, 10), Scope.bind($a, $b)]

    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(2)

    const a = await scope.get($a)
    const b = await scope.get($b)

    expect(calls).toEqual([])
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

    const $findAll = Injectable.define($todoRepository, (repo) => repo.findAll)

    const root = Scope.create({
      bindings: [
        Scope.bind($todoRepository, {
          findAll: () => [
            {
              id: 'xxxx',
              title: 'Wake up'
            }
          ],
          findById: () => undefined
        })
      ]
    })

    const findAll = await root.get($findAll)

    expect(typeof findAll).toBe('function')
    expect(findAll()).toEqual([
      {
        id: 'xxxx',
        title: 'Wake up'
      }
    ])
  })
})
