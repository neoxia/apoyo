import { Container, Implementation, Injectable, Resource } from '../src'

describe('Implementation.create', () => {
  it('should work with values', async () => {
    const $a: Injectable<number> = Implementation.create(() => 42)
    const $b = Implementation.create([$a], (v) => v + 1)

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    const $a: Injectable<number> = Implementation.create(async () => 42)
    const $b = Implementation.create([$a], async (v) => v + 1)

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with resources', async () => {
    const $a: Injectable<number> = Implementation.create(() => Resource.of(42))
    const $b = Implementation.create([$a], (v) => Resource.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async resources', async () => {
    const $a: Injectable<number> = Implementation.create(async () => Resource.of(42))
    const $b = Implementation.create([$a], async (v) => Resource.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    const $a: Injectable<number> = Implementation.create(() => Injectable.of(42))
    const $b = Implementation.create([$a], (v) => Injectable.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    const $a: Injectable<number> = Implementation.create(async () => Injectable.of(42))
    const $b = Implementation.create([$a], async (v) => Injectable.of(v + 1))

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should contain the correct factory function', async () => {
    const $v1 = Implementation.create(() => 2)
    const $v2 = Implementation.create(async () => 2)
    const $v3 = Implementation.create(async () => Injectable.of(2))

    const v1 = $v1.factory()
    expect(v1).toEqual(2)

    const v2 = $v2.factory()
    expect(v2).toBeInstanceOf(Promise)
    expect(await v2).toEqual(2)

    const pV3 = $v3.factory()
    expect(pV3).toBeInstanceOf(Promise)
    const v3 = await pV3
    expect(Injectable.is(v3)).toBeTruthy()
  })

  it('should allow dynamically switching on Vars', async () => {
    const calls: string[] = []

    const $env = Implementation.create(async () => {
      calls.push('env')
      return {
        DISK_STRATEGY: 's3'
      }
    })

    const $s3DiskConfig = Implementation.create(async () => {
      calls.push('s3_config')
      return {}
    })

    const $s3DiskStrategy = Implementation.create([$s3DiskConfig], () => {
      calls.push('s3_strategy')
      return 's3_storage'
    })

    const $azureDiskConfig = Implementation.create(async () => {
      calls.push('azure_config')
      return {}
    })

    const $azureDiskStrategy = Implementation.create([$azureDiskConfig], () => {
      calls.push('azure_strategy')
      return 'azure_storage'
    })

    const $disk = Implementation.create([$env], (env) => {
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
