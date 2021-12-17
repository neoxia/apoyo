import { pipe, Prom, Result } from '@apoyo/std'
import { Resource, Scope, Var } from '../src'
import { SCOPES_INTERNAL } from '../src/types'

describe('ScopeInstance.get', () => {
  it('should load and get the variable once', async () => {
    let calls = 0

    const VarA = Var.thunk(() => {
      ++calls
      return calls
    })

    const scope = Scope.create()

    const a = await scope.get(VarA)
    const b = await scope.get(VarA)

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
  })

  it('should work with vars having dependencies', async () => {
    let calls = 0

    const VarA = Var.thunk(() => {
      ++calls
      return calls
    })
    const VarB = pipe(
      VarA,
      Var.map((nb) => nb * 10)
    )

    const scope = Scope.create()

    const a = await scope.get(VarB)
    const b = await scope.get(VarB)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)

    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.has(VarA.symbol)).toEqual(true)
    expect(internal.created.has(VarB.symbol)).toEqual(true)
    expect(internal.mounted.has(VarA.symbol)).toEqual(true)
    expect(internal.mounted.has(VarB.symbol)).toEqual(true)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const VarA = Var.thunk(async () => {
      ++calls
      await Prom.sleep(200)
      return calls
    })

    const scope = Scope.create()

    const pA = scope.get(VarA)
    const pB = scope.get(VarA)

    const a = await pA
    const b = await pB

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
  })

  it('should mount vars in correct scope', async () => {
    const Env = Var.of({})
    const Db = pipe(
      Env,
      Var.map(() => {
        return {
          query: async (nb: number) => [nb]
        }
      })
    )

    const Req = Var.abstract<number>('Req')

    const Handler = pipe(
      Var.tuple(Req, Db),
      Var.mapArgs(async (req, db) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Var.struct({
        env: Env,
        factory: Scope.factory()
      }),
      Var.map(async ({ factory }) => {
        const bindings = [Scope.bind(Req, 1)]
        const scope = factory.create({
          bindings
        })

        const internal = SCOPES_INTERNAL.get(scope)!

        expect(internal.bindings.has(Req)).toBe(true)

        const value = await scope.get(Handler)

        expect(value).toEqual([1])

        expect(internal.mounted.has(Handler.symbol)).toBe(true)
        expect(internal.mounted.has(Req.symbol)).toBe(true)
        expect(internal.mounted.has(Db.symbol)).toBe(false)

        return value
      })
    )

    const scope = Scope.create()

    const internal = SCOPES_INTERNAL.get(scope)!

    const value = await scope.get(Api)
    expect(value).toEqual([1])

    expect(internal.mounted.has(Api.symbol)).toBe(true)
    expect(internal.mounted.has(Db.symbol)).toBe(true)
    expect(internal.mounted.has(Handler.symbol)).toBe(false)
    expect(internal.mounted.has(Req.symbol)).toBe(false)
  })
})

describe('ScopeInstance.close', () => {
  it('should close correctly', async () => {
    let calls = 0

    const VarA = pipe(
      Var.of(1),
      Var.resource((nb) => {
        return Resource.of(nb * 10, () => {
          ++calls
        })
      })
    )

    const scope = Scope.create()
    const value = await scope.get(VarA)

    expect(value).toBe(10)
    expect(calls).toBe(0)

    await scope.close()

    expect(calls).toBe(1)
  })

  it('should not unmount when not mounted', async () => {
    let calls = 0

    const VarA = pipe(
      Var.of(1),
      Var.resource((nb) => {
        return Resource.of(nb * 10, () => {
          ++calls
        })
      })
    )

    const scope = Scope.create()

    await scope.load(VarA)
    await scope.close()

    expect(calls).toBe(0)
  })

  it('should throw when used after closing', async () => {
    const VarA = Var.of(1)

    const scope = Scope.create()

    await scope.close()

    const result = await pipe(scope.get(VarA), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })

  it('should unmount vars mounted from child scopes correctly', async () => {
    const calls: string[] = []

    const Env = Var.of({})
    const Db = pipe(
      Env,
      Var.resource(() => {
        const db = {
          query: async (nb: number) => [nb],
          close: async () => {
            calls.push('database')
          }
        }

        return Resource.of(db, () => db.close())
      })
    )

    const Req = Var.abstract<number>('Req')

    const Handler = pipe(
      Var.struct({
        req: Req,
        db: Db
      }),
      Var.map(async ({ req, db }) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Var.struct({
        env: Env,
        factory: Scope.factory()
      }),
      Var.resource(({ factory }) => {
        const handlerResponse = factory.run(Handler, {
          bindings: [Scope.bind(Req, 1)]
        })
        return Resource.of(handlerResponse, () => {
          calls.push('api')
        })
      })
    )

    const value = await Scope.run(Api)

    expect(value).toEqual([1])

    // Should first unmount Api, then Db, as Api indirectly depends on Db
    expect(calls).toEqual(['api', 'database'])
  })
})
