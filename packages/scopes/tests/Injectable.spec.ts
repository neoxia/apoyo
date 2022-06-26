import { Container, Injectable, Resource } from '../src'

describe('Injectable.of', () => {
  it('should create a constant', async () => {
    const $a = Injectable.of(1)

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Injectable.lazy', () => {
  it('should allow lazy import', async () => {
    const $a = Injectable.lazy(() => import('./utils/mocks').then((i) => i.$lazy))

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual('lazy')
    expect(b).toEqual('lazy')
  })
})

describe('Injectable.abstract', () => {
  it('should throw by default', async () => {
    const $diskStrategy = Injectable.abstract<{ type: 'aws' | 'azure' }>('DiskStrategy')

    const container = Container.create()

    expect(() => container.get($diskStrategy)).rejects.toThrow()
  })
})

describe('Injectable.define', () => {
  it('should work with values', async () => {
    const $a: Injectable<number> = Injectable.define(() => 42)
    const $b = Injectable.define([$a], (v) => v + 1)

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    const $a: Injectable<number> = Injectable.define(async () => 42)
    const $b = Injectable.define([$a], async (v) => v + 1)

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with resources', async () => {
    const $a: Injectable<number> = Injectable.define(() => Resource.of(42))
    const $b = Injectable.define([$a], (v) => Resource.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async resources', async () => {
    const $a: Injectable<number> = Injectable.define(async () => Resource.of(42))
    const $b = Injectable.define([$a], async (v) => Resource.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    const $a: Injectable<number> = Injectable.define(() => Injectable.of(42))
    const $b = Injectable.define([$a], (v) => Injectable.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    const $a: Injectable<number> = Injectable.define(async () => Injectable.of(42))
    const $b = Injectable.define([$a], async (v) => Injectable.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should contain the correct factory function', async () => {
    const $v1 = Injectable.define(() => 2)
    const $v2 = Injectable.define(async () => 2)
    const $v3 = Injectable.define(async () => Injectable.of(2))

    const v1 = $v1.factory()
    expect(v1).toEqual(2)

    const v2 = $v2.factory()
    expect(v2).toBeInstanceOf(Promise)
    expect(await v2).toEqual(2)

    const pV3 = $v3.factory()
    expect(pV3).toBeInstanceOf(Promise)
    const v3 = await pV3
    expect(v3).toBeInstanceOf(Injectable)
  })

  it('should allow dynamically switching on Vars', async () => {
    const calls: string[] = []

    const $env = Injectable.define(async () => {
      calls.push('env')
      return {
        DISK_STRATEGY: 's3'
      }
    })

    const $s3DiskConfig = Injectable.define(async () => {
      calls.push('s3_config')
      return {}
    })

    const $s3DiskStrategy = Injectable.define([$s3DiskConfig], () => {
      calls.push('s3_strategy')
      return 's3_storage'
    })

    const $azureDiskConfig = Injectable.define(async () => {
      calls.push('azure_config')
      return {}
    })

    const $azureDiskStrategy = Injectable.define([$azureDiskConfig], () => {
      calls.push('azure_strategy')
      return 'azure_storage'
    })

    const $disk = Injectable.define([$env], (env) => {
      calls.push('disk')
      const type = env.DISK_STRATEGY
      if (type === 's3') return $s3DiskStrategy
      if (type === 'azure') return $azureDiskStrategy
      throw new Error(`Unsupported disk strategy ${type}`)
    })

    const container = Container.create({})

    const a: string = await container.get($disk)
    const b: string = await container.get($disk)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_strategy'])

    const c: string = await container.get($s3DiskStrategy)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_strategy'])

    const d: string = await container.get($azureDiskStrategy)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_strategy', 'azure_config', 'azure_strategy'])

    expect(a).toEqual('s3_storage')
    expect(b).toEqual('s3_storage')
    expect(c).toEqual('s3_storage')
    expect(d).toEqual('azure_storage')
  })
})
