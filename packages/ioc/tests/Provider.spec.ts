import { pipe } from '@apoyo/std'
import { Container, Provider, ShutdownPriority } from '../src'
import { AzureConfig, AzureDrive, Drive, DriveConfig, S3Config, S3Drive } from './mocks/drive'

describe('Provider.from', () => {
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

    const $config = Provider.fromFactory(configureDrive, [])
    const $s3DriveConfig = Provider.fromFactory(configureS3Drive, [])
    const $azureDriveConfig = Provider.fromFactory(configureAzureDrive, [])
    const $s3Drive = Provider.fromFactory(createS3Drive, [$s3DriveConfig])
    const $azureDrive = Provider.fromFactory(createAzureDrive, [$azureDriveConfig])

    const $disk = Provider.fromFactory(
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

describe('Provider.fromConst', () => {
  it('should create a constant', async () => {
    const $a = Provider.fromConst(1)

    const container = Container.create()

    const a = await container.get($a)
    const b = await container.get($a)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Provider.fromFactory', () => {
  it('should work with values', async () => {
    const $a: Provider<number> = Provider.fromFactory(() => 42, [])
    const $b: Provider<number> = Provider.fromFactory((v) => v + 1, [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    const $a: Provider<number> = Provider.fromFactory(async () => 42, [])
    const $b: Provider<number> = Provider.fromFactory(async (v) => v + 1, [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    const $a: Provider<number> = Provider.fromFactory(() => Provider.fromConst(42), [])
    const $b: Provider<number> = Provider.fromFactory((v) => Provider.fromConst(v + 1), [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    const $a: Provider<number> = Provider.fromFactory(async () => Provider.fromConst(42), [])
    const $b: Provider<number> = Provider.fromFactory(async (v) => Provider.fromConst(v + 1), [$a])

    const container = Container.create()
    const a = await container.get($a)
    const b = await container.get($b)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })
})

describe('Provider.fromClass', () => {
  class MyClass1 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
  }
  class MyClass2 {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_param: number) {}
  }

  it('should work with classes', async () => {
    const $myClass1 = Provider.fromClass(MyClass1, [])
    const $param = Provider.fromConst(1)
    const $myClass2 = Provider.fromClass(MyClass2, [$param])

    const container = new Container()

    const myClass1 = await container.get($myClass1)
    const myClass2 = await container.get($myClass2)

    expect(myClass1).toBeInstanceOf(MyClass1)
    expect(myClass2).toBeInstanceOf(MyClass2)
  })
})

describe('Provider.asType', () => {
  it('should downcast type correctly and safely', async () => {
    interface Todo {
      id: string
    }

    interface ITodoRepository {
      findById(id: string): Promise<Todo | null>
    }

    class TodoRepository implements ITodoRepository {
      private _todos: Todo[] = []

      public async findById(id: string): Promise<Todo | null> {
        return this._todos.find((todo) => todo.id === id) ?? null
      }
    }

    const $todoRepository = pipe(Provider.fromClass(TodoRepository, []), Provider.asType<ITodoRepository>())

    const scope = Container.create()

    const todoRepository = await scope.get($todoRepository)

    expect(await todoRepository.findById('test')).toEqual(null)

    await scope.close()
  })
})

describe('Provider.asResource', () => {
  it('should store shutdown hooks correctly', async () => {
    const calls: string[] = []

    class MyDatabaseConnection {
      async initialize() {
        // init connection
      }

      async close() {
        // close connection
        calls.push('db')
      }

      async test() {
        // todo
      }
    }

    class MyHttpServer {
      async start() {
        // init connection
      }

      async close() {
        // close connection
        calls.push('http')
      }
    }

    const $db = pipe(
      Provider.fromClass(MyDatabaseConnection, []),
      Provider.asResource({
        priority: ShutdownPriority.LOW,
        init: (db) => db.initialize(),
        close: (db) => db.close()
      })
    )

    const $http = pipe(
      Provider.fromClass(MyHttpServer, []),
      Provider.asResource({
        priority: ShutdownPriority.HIGH,
        init: (server) => server.start(),
        close: (server) => server.close()
      })
    )

    const scope = Container.create()

    const http = await scope.get($http)
    const db = await scope.get($db)

    expect(http).toBeInstanceOf(MyHttpServer)
    expect(db).toBeInstanceOf(MyDatabaseConnection)

    // No close methods should have been called yet.
    expect(calls).toEqual([])

    await scope.close()

    // Should first stop HTTP server (because of higher priority setting), then stop the DB.
    expect(calls).toEqual(['http', 'db'])
  })
})
