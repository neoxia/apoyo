import { Container, Provider } from '../src'

interface DriveConfig {
  type: 's3' | 'azure'
}

interface Drive {
  name: string
}

interface S3Config {
  bucket: string
  region: string
}

interface S3Drive {
  name: 's3'
}

interface AzureConfig {
  container: string
}

interface AzureDrive {
  name: 'azure'
}

describe('UnboundProvider.toConst', () => {
  it('should create a constant', async () => {
    const $a = Provider.bind<number>().toConst(1)

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('UnboundProvider.toFactory', () => {
  it('should work with values', async () => {
    const $a: Provider<number> = Provider.bind<number>().toFactory(() => 42, [])
    const $b: Provider<number> = Provider.bind<number>().toFactory((v) => v + 1, [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    const $a: Provider<number> = Provider.bind<number>().toFactory(async () => 42, [])
    const $b: Provider<number> = Provider.bind<number>().toFactory(async (v) => v + 1, [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    const $a: Provider<number> = Provider.bind<number>().toFactory(() => Provider.bind<number>().toConst(42), [])
    const $b: Provider<number> = Provider.bind<number>().toFactory((v) => Provider.bind<number>().toConst(v + 1), [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    const $a: Provider<number> = Provider.bind<number>().toFactory(async () => Provider.bind<number>().toConst(42), [])
    const $b: Provider<number> = Provider.bind<number>().toFactory(
      async (v) => Provider.bind<number>().toConst(v + 1),
      [$a]
    )

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should allow dynamically switching on Vars', async () => {
    const calls: string[] = []

    function configureDrive(): DriveConfig {
      calls.push('env')
      return {
        type: 's3'
      }
    }
    function configureS3Drive(): S3Config {
      calls.push('s3_config')
      return {
        bucket: 'test',
        region: 'eu-west-1'
      }
    }
    function configureAzureDrive(): AzureConfig {
      calls.push('azure_config')
      return {
        container: 'test'
      }
    }
    function createS3Drive(config: S3Config): S3Drive {
      calls.push('s3_drive')
      return {
        name: 's3',
        ...config
      }
    }
    function createAzureDrive(config: AzureConfig): AzureDrive {
      calls.push('azure_drive')
      return {
        name: 'azure',
        ...config
      }
    }

    const $config = Provider.bind<DriveConfig>().toFactory(configureDrive, [])
    const $s3DriveConfig = Provider.bind<S3Config>().toFactory(configureS3Drive, [])
    const $azureDriveConfig = Provider.bind<AzureConfig>().toFactory(configureAzureDrive, [])
    const $s3Drive = Provider.bind<S3Drive>().toFactory(createS3Drive, [$s3DriveConfig])
    const $azureDrive = Provider.bind<AzureDrive>().toFactory(createAzureDrive, [$azureDriveConfig])

    const $disk = Provider.bind<Drive>().toFactory(
      (config): Provider<Drive> => {
        calls.push('disk')
        const type = config.type
        if (type === 's3') return $s3Drive
        if (type === 'azure') return $azureDrive
        throw new Error(`Unsupported disk strategy ${type}`)
      },
      [$config]
    )

    const container = Container.create({})

    const a: Drive = await container.get($disk)
    const b: Drive = await container.get($disk)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive'])

    const c: Drive = await container.get($s3Drive)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive'])

    const d: Drive = await container.get($azureDrive)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive', 'azure_config', 'azure_drive'])

    expect(a.name).toEqual('s3')
    expect(b.name).toEqual('s3')
    expect(c.name).toEqual('s3')
    expect(d.name).toEqual('azure')
  })
})

describe('UnboundProvider.toClass', () => {
  class MyClass1 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
  }
  class MyClass2 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_param: number) {}
  }

  it('should work with classes', async () => {
    const $myClass1 = Provider.bind<MyClass1>().toClass(MyClass1, [])
    const $param = Provider.bind<number>().toConst(1)
    const $myClass2 = Provider.bind<MyClass2>().toClass(MyClass2, [$param])

    const container = new Container()

    const myClass1 = await container.get($myClass1)
    const myClass2 = await container.get($myClass2)

    expect(myClass1).toBeInstanceOf(MyClass1)
    expect(myClass2).toBeInstanceOf(MyClass2)
  })
})

describe('UnboundProvider.toAbstract', () => {
  it('should throw', async () => {
    const $diskStrategy = Provider.bind<DriveConfig>().toAbstract('DiskStrategy')

    const container = Container.create()

    expect(container.get($diskStrategy)).rejects.toThrow()
  })

  it('should get bound value', async () => {
    const $diskStrategy = Provider.bind<DriveConfig>().toAbstract('DiskStrategy')

    const container = Container.create({
      bindings: [
        Container.bind($diskStrategy, {
          type: 's3'
        })
      ]
    })

    expect(container.get($diskStrategy)).resolves.toEqual({
      type: 's3'
    })
  })
})
