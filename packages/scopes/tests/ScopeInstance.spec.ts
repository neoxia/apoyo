import { pipe, Prom, Result } from '@apoyo/std'
import { Resource, Scope, Injectable } from '../src'
import { SCOPE_INTERNAL } from '../src/scopes/symbols'

describe('ScopeInstance.get', () => {
  it('should load and get the variable once', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      ++calls
      return calls
    })

    const scope = Scope.create()

    const a = await scope.get($a)
    const b = await scope.get($a)

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
  })

  it('should work with vars having dependencies', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      ++calls
      return calls
    })
    const $b = Injectable.define($a, (nb) => nb * 10)

    const scope = Scope.create()

    const a = await scope.get($b)
    const b = await scope.get($b)

    expect(calls).toBe(1)
    expect(a).toBe(10)
    expect(b).toBe(10)

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
    expect(internal.created.has(Injectable.getReference($a))).toEqual(true)
    expect(internal.created.has(Injectable.getReference($b))).toEqual(true)
    expect(internal.mounted.has(Injectable.getReference($a))).toEqual(true)
    expect(internal.mounted.has(Injectable.getReference($b))).toEqual(true)
  })

  it('should not mount more than once when loaded in concurrency', async () => {
    let calls = 0

    const $a = Injectable.define(async () => {
      ++calls
      await Prom.sleep(200)
      return calls
    })

    const scope = Scope.create()

    const pA = scope.get($a)
    const pB = scope.get($a)

    const a = await pA
    const b = await pB

    expect(calls).toBe(1)
    expect(a).toBe(1)
    expect(b).toBe(1)

    const internal = scope[SCOPE_INTERNAL]

    expect(internal.unmount.length).toEqual(0)
  })

  it('should mount vars in correct scope', async () => {
    const $env = Injectable.of({})
    const $db = Injectable.define($env, () => {
      return {
        query: async (nb: number) => [nb]
      }
    })

    const $req = Injectable.abstract<number>('Req')

    const $handler = Injectable.define($req, $db, async (req, db) => {
      return await db.query(req)
    })

    const $requestFactory = Scope.Factory()
    const $api = Injectable.define($env, $requestFactory, async (_env, factory) => {
      const bindings = [Scope.bind($req, 1)]
      const scope = factory.create({
        bindings
      })

      const internal = scope[SCOPE_INTERNAL]

      expect(internal.bindings.has(Injectable.getReference($req))).toBe(true)

      const value = await scope.get($handler)

      expect(value).toEqual([1])

      expect(internal.mounted.has(Injectable.getReference($handler))).toBe(true)
      expect(internal.mounted.has(Injectable.getReference($req))).toBe(true)
      expect(internal.mounted.has(Injectable.getReference($db))).toBe(false)

      return value
    })

    const scope = Scope.create()

    const internal = scope[SCOPE_INTERNAL]

    const value = await scope.get($api)
    expect(value).toEqual([1])

    expect(internal.mounted.has(Injectable.getReference($api))).toBe(true)
    expect(internal.mounted.has(Injectable.getReference($db))).toBe(true)
    expect(internal.mounted.has(Injectable.getReference($handler))).toBe(false)
    expect(internal.mounted.has(Injectable.getReference($req))).toBe(false)
  })
})

describe('ScopeInstance.close', () => {
  it('should close correctly', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      return Resource.of(10, () => {
        ++calls
      })
    })

    const scope = Scope.create()
    const value = await scope.get($a)

    expect(value).toBe(10)
    expect(calls).toBe(0)

    await scope.close()

    expect(calls).toBe(1)
  })

  it('should not unmount when not mounted', async () => {
    let calls = 0

    const $a = Injectable.define(() => {
      return Resource.of(10, () => {
        ++calls
      })
    })

    const scope = Scope.create()

    await scope.load($a)
    await scope.close()

    expect(calls).toBe(0)
  })

  it('should throw when used after closing', async () => {
    const $a = Injectable.of(1)

    const scope = Scope.create()

    await scope.close()

    const result = await pipe(scope.get($a), Prom.tryCatch)

    expect(pipe(result, Result.isKo)).toBe(true)
  })

  it('should unmount vars mounted from child scopes correctly', async () => {
    const calls: string[] = []

    const $env = Injectable.of({})
    const $db = Injectable.define($env, () => {
      const db = {
        query: async (nb: number) => [nb],
        close: async () => {
          calls.push('database')
        }
      }

      return Resource.of(db, () => db.close())
    })

    const $req = Injectable.abstract<number>('Req')

    const $handler = Injectable.define($req, $db, async (req, db) => {
      return await db.query(req)
    })

    const $requestFactory = Scope.Factory()
    const $api = Injectable.define($env, $requestFactory, (_env, factory) => {
      const handlerResponse = factory.run($handler, {
        bindings: [Scope.bind($req, 1)]
      })
      return Resource.of(handlerResponse, () => {
        calls.push('api')
      })
    })

    const value = await Scope.run($api)

    expect(value).toEqual([1])

    // Should first unmount Api, then Db, as Api indirectly depends on Db
    expect(calls).toEqual(['api', 'database'])
  })
})
