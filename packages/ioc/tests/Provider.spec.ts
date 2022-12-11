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

    class ConfigModule {
      static CONFIG = Provider.fromFactory(configureDrive, [])
      static S3_DRIVE_CONFIG = Provider.fromFactory(configureS3Drive, [])
      static AZURE_DRIVE_CONFIG = Provider.fromFactory(configureAzureDrive, [])
    }

    class FilesModule {
      static S3_DRIVE = Provider.fromFactory(createS3Drive, [ConfigModule.S3_DRIVE_CONFIG])
      static AZURE_DRIVE = Provider.fromFactory(createAzureDrive, [ConfigModule.AZURE_DRIVE_CONFIG])

      static DRIVE = Provider.from(
        async (container): Promise<Provider<Drive>> => {
          const config = await container.get(ConfigModule.CONFIG)

          calls.push('disk')
          const type = config.type
          if (type === 's3') return FilesModule.S3_DRIVE
          if (type === 'azure') return FilesModule.AZURE_DRIVE
          throw new Error(`Unsupported disk strategy ${type}`)
        }
      )
    }

    const container = Container.create({})

    const a: Drive = await container.get(FilesModule.DRIVE)
    const b: Drive = await container.get(FilesModule.DRIVE)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive'])

    const c: Drive = await container.get(FilesModule.S3_DRIVE)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive'])

    const d: Drive = await container.get(FilesModule.AZURE_DRIVE)

    expect(calls).toEqual(['env', 'disk', 's3_config', 's3_drive', 'azure_config', 'azure_drive'])

    expect(a.name).toEqual('s3')
    expect(b.name).toEqual('s3')
    expect(c.name).toEqual('s3')
    expect(d.name).toEqual('azure')
  })
})

describe('Provider.fromConst', () => {
  it('should create a constant', async () => {
    class MyModule {
      static A = Provider.fromConst(1)
    }

    const container = Container.create()

    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.A)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Provider.fromFactory', () => {
  it('should work with values', async () => {
    class MyModule {
      static A: Provider<number> = Provider.fromFactory(() => 42, [])
      static B: Provider<number> = Provider.fromFactory((v) => v + 1, [MyModule.A])
    }

    const container = Container.create()
    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async values', async () => {
    class MyModule {
      static A: Provider<number> = Provider.fromFactory(async () => 42, [])
      static B: Provider<number> = Provider.fromFactory(async (v) => v + 1, [MyModule.A])
    }

    const container = Container.create()
    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with nested injectables', async () => {
    class MyModule {
      static A: Provider<number> = Provider.fromFactory(() => Provider.fromConst(42), [])
      static B: Provider<number> = Provider.fromFactory((v) => Provider.fromConst(v + 1), [MyModule.A])
    }

    const container = Container.create()
    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)

    expect(a).toEqual(42)
    expect(b).toEqual(43)
  })

  it('should work with async nested injectables', async () => {
    class MyModule {
      static A: Provider<number> = Provider.fromFactory(async () => Provider.fromConst(42), [])
      static B: Provider<number> = Provider.fromFactory(async (v) => Provider.fromConst(v + 1), [MyModule.A])
    }

    const container = Container.create()
    const a = await container.get(MyModule.A)
    const b = await container.get(MyModule.B)

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
    class MyModule {
      static MY_CLASS_1 = Provider.fromClass(MyClass1, [])
      static MY_PARAM = Provider.fromConst(1)
      static MY_CLASS_2 = Provider.fromClass(MyClass2, [MyModule.MY_PARAM])
    }

    const container = new Container()

    const myClass1 = await container.get(MyModule.MY_CLASS_1)
    const myClass2 = await container.get(MyModule.MY_CLASS_2)

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

    class MyModule {
      static TODO_REPOSITORY = pipe(Provider.fromClass(TodoRepository, []), Provider.asType<ITodoRepository>())
    }

    const scope = Container.create()

    const todoRepository = await scope.get(MyModule.TODO_REPOSITORY)

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

    class DatabaseModule {
      static DATABASE = pipe(
        Provider.fromClass(MyDatabaseConnection, []),
        Provider.asResource({
          priority: ShutdownPriority.LOW,
          init: (db) => db.initialize(),
          close: (db) => db.close()
        })
      )
    }

    class HttpModule {
      static SERVER = pipe(
        Provider.fromClass(MyHttpServer, []),
        Provider.asResource({
          priority: ShutdownPriority.HIGH,
          init: (server) => server.start(),
          close: (server) => server.close()
        })
      )
    }

    const scope = Container.create()

    const http = await scope.get(HttpModule.SERVER)
    const db = await scope.get(DatabaseModule.DATABASE)

    expect(http).toBeInstanceOf(MyHttpServer)
    expect(db).toBeInstanceOf(MyDatabaseConnection)

    // No close methods should have been called yet.
    expect(calls).toEqual([])

    await scope.close()

    // Should first stop HTTP server (because of higher priority setting), then stop the DB.
    expect(calls).toEqual(['http', 'db'])
  })
})
