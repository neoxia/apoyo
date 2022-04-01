import { pipe, Prom, Result } from '@apoyo/std'
import { Scope, Injectable, Resource } from '../src'

describe('Injectable.of', () => {
  it('should create a constant', async () => {
    const $a = Injectable.of(1)

    const root = Scope.create()

    const a = await root.get($a)
    const b = await root.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })

  it('should always create a constant on root level', async () => {
    const $a = Injectable.of(1)

    const root = Scope.create()
    const factory = root.factory()
    const child = factory.create()

    const a = await child.get($a)
    const b = await root.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Injectable.lazy', () => {
  it('should allow lazy import', async () => {
    const $a = Injectable.lazy(() => import('./utils/mocks').then((i) => i.$lazy))

    const root = Scope.create()

    const a = await root.get($a)
    const b = await root.get($a)

    expect(a).toEqual('lazy')
    expect(b).toEqual('lazy')
  })
})

describe('Injectable.abstract', () => {
  it('should throw by default', async () => {
    const $storageConfig = Injectable.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')

    const root = Scope.create()

    const err = await pipe(root.get($storageConfig), Prom.tryCatch)

    expect(pipe(err, Result.isKo)).toBe(true)
  })
})

describe('Injectable.struct', () => {
  it('should combine a struct of vars into a single var', async () => {
    const $a = Injectable.of(1)
    const $b = Injectable.of(2)
    const $c = Injectable.struct({
      a: $a,
      b: $b
    })

    const value = await Scope.run($c)
    expect(value).toEqual({
      a: 1,
      b: 2
    })
  })
})

describe('Injectable.define', () => {
  it('should work with values', async () => {
    const $a: Injectable<number> = Injectable.define(() => 42)
    const $b = Injectable.define($a, (v) => v + 1)

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    const $a: Injectable<number> = Injectable.define(async () => 42)
    const $b = Injectable.define($a, async (v) => v + 1)

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with resources', async () => {
    const $a: Injectable<number> = Injectable.define(() => Resource.of(42))
    const $b = Injectable.define($a, (v) => Resource.of(v + 1))

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async resources', async () => {
    const $a: Injectable<number> = Injectable.define(async () => Resource.of(42))
    const $b = Injectable.define($a, async (v) => Resource.of(v + 1))

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    const $a: Injectable<number> = Injectable.define(() => Injectable.of(42))
    const $b = Injectable.define($a, (v) => Injectable.of(v + 1))

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    const $a: Injectable<number> = Injectable.define(async () => Injectable.of(42))
    const $b = Injectable.define($a, async (v) => Injectable.of(v + 1))

    const root = Scope.create()
    const a = await root.get($a)
    const b = await root.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should contain the correct factory function', async () => {
    const $v1 = Injectable.define(() => 2)
    const $v2 = Injectable.define(async () => 2)
    const $v3 = Injectable.define(async () => Injectable.of(2))

    const factory1 = Injectable.getFactory($v1)
    const v1 = factory1()
    expect(v1).toEqual(2)

    const factory2 = Injectable.getFactory($v2)
    const v2 = factory2()
    expect(v2 instanceof Promise).toBe(true)
    expect(await v2).toEqual(2)

    const factory3 = Injectable.getFactory($v3)
    const v3 = factory3()
    expect(v3 instanceof Promise).toBe(true)
    expect(Injectable.isInjectable(await v3)).toBe(true)
  })

  it('should allow dynamically switching on Vars', async () => {
    const calls: string[] = []

    const $env = Injectable.define(async () => {
      calls.push('env')
      return {}
    })

    const $awsStorage = Injectable.define($env, () => {
      calls.push('aws_storage')
      return 'aws_storage'
    })

    const $azureStorage = Injectable.define($env, () => {
      calls.push('azure_storage')
      return 'azure_storage'
    })

    const $storageConfig = Injectable.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')
    const $storageType = Injectable.define($storageConfig, (config) => {
      calls.push('storage_type')
      return config.type
    })

    const $storage = Injectable.define($storageType, (type) => {
      calls.push('storage_by_type')
      if (type === 'aws') return $awsStorage
      if (type === 'azure') return $azureStorage
      throw new Error(`Unimplemented storage type ${type}`)
    })

    const root = Scope.create({
      bindings: [
        Scope.bind($storageConfig, {
          type: 'aws'
        })
      ]
    })

    const a: string = await root.get($storage)
    const b: string = await root.get($storage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage'])

    const c: string = await root.get($awsStorage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage'])

    const d: string = await root.get($azureStorage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage', 'azure_storage'])

    expect(a).toEqual('aws_storage')
    expect(b).toEqual('aws_storage')
    expect(c).toEqual('aws_storage')
    expect(d).toEqual('azure_storage')
  })
})
