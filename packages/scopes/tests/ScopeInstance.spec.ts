import { pipe, Prom, Result } from '@apoyo/std'
import { Resource, Scope, Injectable } from '../src'
import { SCOPE_INTERNAL } from '../src/scopes/symbols'

describe('ScopeInstance.get', () => {
  it('should load and get the variable once', async () => {
    let calls = 0

    const VarA = Injectable.thunk(() => {
      ++calls
      return calls
    })

    const scope = Scope.create()

    const a = await scope.get(VarA)
    const b = await scope.get(VarA)

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
  })

  it('should work with vars having dependencies', async () => {
    let calls = 0

    const VarA = Injectable.thunk(() => {
      ++calls
      return calls
    })
    const VarB = pipe(
      VarA,
      Injectable.map((nb) => nb * 10)
    )

    const scope = Scope.create()

    const a = await scope.get(VarB)
    const b = await scope.get(VarB)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.has(Injectable.getReference(VarA))).toEqual(true)
    expect(internal.created.has(Injectable.getReference(VarB))).toEqual(true)
    expect(internal.mounted.has(Injectable.getReference(VarA))).toEqual(true)
    expect(internal.mounted.has(Injectable.getReference(VarB))).toEqual(true)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const VarA = Injectable.thunk(async () => {
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

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
  })

  it('should mount vars in correct scope', async () => {
    const Env = Injectable.of({})
    const Db = pipe(
      Env,
      Injectable.map(() => {
        return {
          query: async (nb: number) => [nb]
        }
      })
    )

    const Req = Injectable.abstract<number>('Req')

    const Handler = pipe(
      Injectable.tuple(Req, Db),
      Injectable.mapArgs(async (req, db) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Injectable.struct({
        env: Env,
        factory: Scope.Factory()
      }),
      Injectable.map(async ({ factory }) => {
        const bindings = [Scope.bind(Req, 1)]
        const scope = factory.create({
          bindings
        })

        const internal = scope[SCOPE_INTERNAL]

        expect(internal.bindings.has(Injectable.getReference(Req))).toBe(true)

        const value = await scope.get(Handler)

        expect(value).toEqual([1])

        expect(internal.mounted.has(Injectable.getReference(Handler))).toBe(true)
        expect(internal.mounted.has(Injectable.getReference(Req))).toBe(true)
        expect(internal.mounted.has(Injectable.getReference(Db))).toBe(false)

        return value
      })
    )

    const scope = Scope.create()

    const internal = scope[SCOPE_INTERNAL]

    const value = await scope.get(Api)
    expect(value).toEqual([1])

    expect(internal.mounted.has(Injectable.getReference(Api))).toBe(true)
    expect(internal.mounted.has(Injectable.getReference(Db))).toBe(true)
    expect(internal.mounted.has(Injectable.getReference(Handler))).toBe(false)
    expect(internal.mounted.has(Injectable.getReference(Req))).toBe(false)
  })
})

describe('ScopeInstance.close', () => {
  it('should close correctly', async () => {
    let calls = 0

    const VarA = pipe(
      Injectable.of(1),
      Injectable.resource((nb) => {
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
      Injectable.of(1),
      Injectable.resource((nb) => {
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
    const VarA = Injectable.of(1)

    const scope = Scope.create()

    await scope.close()

    const result = await pipe(scope.get(VarA), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })

  it('should unmount vars mounted from child scopes correctly', async () => {
    const calls: string[] = []

    const Env = Injectable.of({})
    const Db = pipe(
      Env,
      Injectable.resource(() => {
        const db = {
          query: async (nb: number) => [nb],
          close: async () => {
            calls.push('database')
          }
        }

        return Resource.of(db, () => db.close())
      })
    )

    const Req = Injectable.abstract<number>('Req')

    const Handler = pipe(
      Injectable.struct({
        req: Req,
        db: Db
      }),
      Injectable.map(async ({ req, db }) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Injectable.struct({
        env: Env,
        factory: Scope.Factory()
      }),
      Injectable.resource(({ factory }) => {
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
