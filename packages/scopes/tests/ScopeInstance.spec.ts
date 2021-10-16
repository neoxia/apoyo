import { pipe, Prom, Result } from '@apoyo/std'
import { Scope, Var } from '../src'
import { SCOPES_INTERNAL } from '../src/types'

describe('ScopeInstance.get', () => {
  it('should load and get the variable once', async () => {
    let calls = 0

    const VarA = Var.thunk(() => {
      ++calls
      return calls
    })

    const scope = pipe(Scope.create(), Scope.get)

    const a = await scope.get(VarA)
    const b = await scope.get(VarA)

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.size).toEqual(1)
    expect(internal.mounted.size).toEqual(1)
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

    const scope = pipe(Scope.create(), Scope.get)

    const a = await scope.get(VarB)
    const b = await scope.get(VarB)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.size).toEqual(2)
    expect(internal.mounted.size).toEqual(2)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const VarA = Var.thunk(async () => {
      ++calls
      await Prom.sleep(200)
      return calls
    })

    const scope = pipe(Scope.create(), Scope.get)

    const pA = scope.get(VarA)
    const pB = scope.get(VarA)

    const a = await pA
    const b = await pB

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const internal = SCOPES_INTERNAL.get(scope)!

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.size).toEqual(1)
    expect(internal.mounted.size).toEqual(1)
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
      Var.inject(Req, Db),
      Var.map(async ([req, db]) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Var.inject(Env, Var.spawner()),
      Var.map(async ([_env, spawnChild]) => {
        const req = 1
        const scope = pipe(spawnChild(), Scope.bind(Req, Var.of(req)), Scope.get)

        const value = await scope.get(Handler)

        expect(value).toEqual([1])

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const internal = SCOPES_INTERNAL.get(scope)!

        expect(internal.mounted.has(Handler)).toBe(true)
        expect(internal.mounted.has(Req)).toBe(true)

        return value
      })
    )

    const scope = pipe(Scope.create(), Scope.get)

    const value = await scope.get(Api)
    expect(value).toEqual([1])
  })
})

describe('ScopeInstance.close', () => {
  it('should close correctly', async () => {
    let calls = 0

    const VarA = pipe(
      Var.of(1),
      Var.map((nb) => nb * 10),
      Var.closeWith(() => {
        ++calls
      })
    )

    const scope = pipe(Scope.create(), Scope.get)
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
      Var.map((nb) => nb * 10),
      Var.closeWith(() => {
        ++calls
      })
    )

    const scope = await pipe(Scope.create(), Scope.get)

    await scope.load(VarA)
    await scope.close()

    expect(calls).toBe(0)
  })

  it('should throw when used after closing', async () => {
    const VarA = Var.of(1)

    const scope = pipe(Scope.create(), Scope.get)

    await scope.close()

    const result = await pipe(scope.get(VarA), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })

  it('should unmount vars mounted from child scopes correctly', async () => {
    const calls: string[] = []

    const Env = Var.of({})
    const Db = pipe(
      Env,
      Var.map(() => {
        return {
          query: async (nb: number) => [nb],
          close: () => {
            calls.push('database')
          }
        }
      }),
      Var.closeWith((db) => db.close())
    )

    const Req = Var.abstract<number>('Req')

    const Handler = pipe(
      Var.inject(Req, Db),
      Var.map(async ([req, db]) => {
        return await db.query(req)
      })
    )

    const Api = pipe(
      Var.inject(Env, Var.spawner()),
      Var.map(([_env, spawnChild]) => {
        const req = 1
        return pipe(spawnChild(), Scope.bind(Req, Var.of(req)), Scope.run(Handler))
      }),
      Var.closeWith(() => {
        calls.push('api')
      })
    )

    const value = await pipe(Scope.create(), Scope.run(Api))

    expect(value).toEqual([1])

    // Should first unmount Api, then Db, as Api indirectly depends on Db
    expect(calls).toEqual(['api', 'database'])
  })
})
