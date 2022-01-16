import { pipe, Prom, Result, Option } from '@apoyo/std'
import { Resource, Scope, Var } from '../src'
import { SCOPE_INTERNAL, SCOPE_SYMBOL } from '../src/scopes/symbols'

describe('Scope.create', () => {
  it('should build and return scope', () => {
    const scope = Scope.create()

    expect(scope[SCOPE_SYMBOL]).toEqual(true)
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
    const Main = pipe(
      Var.of(1),
      Var.resource((nb) => {
        return Resource.of(nb * 10, () => {
          ++unmountCalls
        })
      })
    )

    const value = await Scope.run(Main)

    expect(value).toBe(10)
    expect(unmountCalls).toBe(1)
  })

  it('should also close on error', async () => {
    let unmountCalls = 0

    const Db = pipe(
      Var.empty,
      Var.resource(() => {
        const db = {
          close: async () => {
            await Prom.sleep(100)
            ++unmountCalls
          }
        }

        return Resource.of(db, () => db.close())
      })
    )

    const Main = pipe(
      Db,
      Var.map(() => {
        throw new Error('expected')
      })
    )

    const result = await pipe(Scope.run(Main), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
    expect(unmountCalls).toBe(1)
  })
})

describe('Scope.bind', () => {
  it('should bind a Var to a constant value', async () => {
    const calls: string[] = []
    const VarA = Var.thunk(() => {
      calls.push('a')
      return 1
    })

    const bindings = [Scope.bind(VarA, 2)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]
    expect(internal.bindings.size).toBe(1)

    const a = await scope.get(VarA)

    expect(calls).toEqual([])
    expect(a).toBe(2)
  })

  it('should bind a Var to another Var', async () => {
    const calls: string[] = []
    const VarA = Var.thunk(() => {
      calls.push('a')
      return 1
    })
    const VarB = Var.thunk(() => {
      calls.push('b')
      return 2
    })

    const bindings = [Scope.bind(VarA, VarB)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(1)

    const a = await scope.get(VarA)
    const b = await scope.get(VarB)

    expect(calls).toEqual(['b'])
    expect(a).toBe(2)
    expect(b).toBe(2)
  })

  it('should resolve deeply', async () => {
    const calls: string[] = []
    const VarA = Var.thunk(() => {
      calls.push('a')
      return 1
    })
    const VarB = Var.thunk(() => {
      calls.push('b')
      return 2
    })
    const VarC = Var.thunk(() => {
      calls.push('c')
      return 3
    })

    const bindings = [Scope.bind(VarB, VarC), Scope.bind(VarA, VarB)]
    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(2)

    const a = await scope.get(VarA)
    const b = await scope.get(VarB)
    const c = await scope.get(VarC)

    expect(calls).toEqual(['c'])
    expect(a).toBe(3)
    expect(b).toBe(3)
    expect(c).toBe(3)
  })

  it('should resolve correctly with Vars and constants', async () => {
    const calls: string[] = []
    const VarA = Var.thunk(() => {
      calls.push('a')
      return 1
    })
    const VarB = Var.thunk(() => {
      calls.push('b')
      return 2
    })

    const bindings = [Scope.bind(VarB, 10), Scope.bind(VarA, VarB)]

    const scope = Scope.create({
      bindings
    })

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.bindings.size).toBe(2)

    const a = await scope.get(VarA)
    const b = await scope.get(VarB)

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

    const ITodoRepository = Var.abstract<ITodoRepository>('ITodoRepository')

    const FindAll = pipe(
      ITodoRepository,
      Var.map((repo) => repo.findAll)
    )

    const root = Scope.create({
      bindings: [
        Scope.bind(ITodoRepository, {
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

    const findAll = await root.get(FindAll)

    expect(typeof findAll).toBe('function')
    expect(findAll()).toEqual([
      {
        id: 'xxxx',
        title: 'Wake up'
      }
    ])
  })
})
