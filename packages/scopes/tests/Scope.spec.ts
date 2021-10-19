import { pipe, Prom, Result } from '@apoyo/std'
import { Scope, Var } from '../src'
import { SCOPES_INTERNAL } from '../src/types'

describe('Scope.create', () => {
  it('should create scope without parent context', () => {
    const builder = Scope.create()

    expect(builder.parent).toEqual(undefined)
  })
})

describe('Scope.childOf', () => {
  it('should create scope with parent context', () => {
    const root = pipe(Scope.create(), Scope.get)

    const VarA = Var.of(1)

    const builder = Scope.childOf({
      scope: root,
      variable: VarA
    })

    const childScope = Scope.get(builder)

    expect(builder.parent?.scope).toEqual(root)
    expect(builder.parent?.variable).toEqual(VarA)

    expect(childScope.parent?.scope).toEqual(root)
    expect(childScope.parent?.variable).toEqual(VarA)
  })
})

describe('Scope.get', () => {
  it('should build and return scope', () => {
    const scope = pipe(Scope.create(), Scope.get)

    expect(scope.tag).toEqual('scope')
    expect(scope.parent).toEqual(undefined)
    expect(typeof scope.get).toEqual('function')
    expect(typeof scope.close).toEqual('function')

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
  })
})

describe('Scope.run', () => {
  it('should run given variable and return result', async () => {
    let unmountCalls = 0
    const Main = pipe(
      Var.of(1),
      Var.map((nb) => nb * 10),
      Var.closeWith(() => {
        ++unmountCalls
      })
    )

    const value = await pipe(Scope.create(), Scope.run(Main))

    expect(value).toBe(10)
    expect(unmountCalls).toBe(1)
  })

  it('should also close on error', async () => {
    let unmountCalls = 0

    const Db = pipe(
      Var.thunk(() => {
        return {
          close: async () => {
            await Prom.sleep(100)
            ++unmountCalls
          }
        }
      }),
      Var.closeWith((db) => db.close())
    )

    const Main = pipe(
      Db,
      Var.map(() => {
        throw new Error('expected')
      })
    )

    const result = await pipe(Scope.create(), Scope.run(Main), Prom.tryCatch)

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

    const builder = pipe(Scope.create(), Scope.bind(VarA, 2))

    expect(builder.bindings.size).toBe(1)
    const scope = Scope.get(builder)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const internal = SCOPES_INTERNAL.get(scope)!
    expect(internal.bindings.size).toBe(1)

    const a = await scope.get(VarA)

    expect(calls).toEqual([])
    expect(a).toBe(2)
  })

  // TODO: disabled for now, support in another version
  // it('should bind a Var to another Var', async () => {
  //   const calls: string[] = []
  //   const VarA = Var.thunk(() => {
  //     calls.push('a')
  //     return 1
  //   })
  //   const VarB = Var.thunk(() => {
  //     calls.push('b')
  //     return 2
  //   })
  //   const builder = pipe(Scope.create(), Scope.bind(VarA, VarB))
  //   expect(builder.bindings.size).toBe(1)
  //   const scope = Scope.get(builder)
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   const internal = SCOPES_INTERNAL.get(scope)!
  //   expect(internal.bindings.size).toBe(1)
  //   const a = await scope.get(VarA)
  //   const b = await scope.get(VarB)
  //   expect(calls).toEqual(['b'])
  //   expect(a).toBe(2)
  //   expect(b).toBe(2)
  // })
  // it('should resolve deeply', async () => {
  //   const calls: string[] = []
  //   const VarA = Var.thunk(() => {
  //     calls.push('a')
  //     return 1
  //   })
  //   const VarB = Var.thunk(() => {
  //     calls.push('b')
  //     return 2
  //   })
  //   const VarC = Var.thunk(() => {
  //     calls.push('c')
  //     return 3
  //   })
  //   const builder = pipe(Scope.create(), Scope.bind(VarB, VarC), Scope.bind(VarA, VarB))
  //   expect(builder.bindings.size).toBe(2)
  //   const scope = Scope.get(builder)
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   const internal = SCOPES_INTERNAL.get(scope)!
  //   expect(internal.bindings.size).toBe(2)
  //   const a = await scope.get(VarA)
  //   const b = await scope.get(VarB)
  //   const c = await scope.get(VarC)
  //   expect(calls).toEqual(['c'])
  //   expect(a).toBe(3)
  //   expect(b).toBe(3)
  //   expect(c).toBe(3)
  // })
})
