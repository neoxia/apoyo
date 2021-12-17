import { pipe, Prom, Result } from '@apoyo/std'
import { Scope, Var } from '../src'

describe('Var.thunk', () => {
  it('should create a constant', async () => {
    let calls = 0
    const VarA = Var.thunk(() => {
      ++calls
      return 1
    })

    const root = Scope.create()

    const a = await root.get(VarA)
    const b = await root.get(VarA)

    expect(calls).toBe(1)
    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })

  it('should always create a constant on root level', async () => {
    let calls = 0
    const VarA = Var.thunk(() => {
      ++calls
      return 1
    })

    const root = Scope.create()

    const Factory = Scope.factory()
    const factory = await root.get(Factory)

    const child = factory.create()

    const a = await child.get(VarA)
    const b = await root.get(VarA)

    expect(calls).toBe(1)
    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Var.of', () => {
  it('should create a constant', async () => {
    const VarA = Var.of(1)

    const root = Scope.create()

    const a = await root.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })

  it('should always create a constant on root level', async () => {
    const VarA = Var.of(1)

    const root = Scope.create()

    const Factory = Scope.factory()
    const factory = await root.get(Factory)

    const child = factory.create()

    const a = await child.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Var.lazy', () => {
  it('should allow lazy import', async () => {
    const VarA = Var.lazy(() => import('./utils/mocks').then((i) => i.LazyVar))

    const root = Scope.create()

    const a = await root.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual('lazy')
    expect(b).toEqual('lazy')
  })
})

describe('Var.abstract', () => {
  it('should throw by default', async () => {
    const CurrentStorage = Var.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')

    const root = Scope.create()

    const err = await pipe(root.get(CurrentStorage), Prom.tryCatch)

    expect(pipe(err, Result.isKo)).toBe(true)
  })
})

describe('Var.map', () => {
  const VarA = Var.of(1)
  const VarB = pipe(
    VarA,
    Var.map((a) => a * 2)
  )

  it('should map the variable correctly', async () => {
    const root = Scope.create()
    const value = await root.get(VarB)
    expect(value).toEqual(2)
  })

  it('should contain the correct factory function', async () => {
    const factory = VarB.factory
    const value = await factory(1)
    expect(value).toEqual(2)
  })
})

describe('Var.chain', () => {
  it('should allow dynamically switching on Vars', async () => {
    const calls: string[] = []

    const Env = Var.thunk(async () => {
      calls.push('env')
      return {}
    })

    const AWSStorage = pipe(
      Env,
      Var.map(() => {
        calls.push('aws_storage')
        return 'aws_storage'
      })
    )
    const AzureStorage = pipe(
      Env,
      Var.map(() => {
        calls.push('azure_storage')
        return 'azure_storage'
      })
    )

    const StorageConfig = Var.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')

    const StorageType = pipe(
      StorageConfig,
      Var.map((config) => {
        calls.push('storage_type')
        return config.type
      })
    )

    const StorageByType = pipe(
      StorageType,
      Var.chain((type) => {
        calls.push('storage_by_type')
        if (type === 'aws') return AWSStorage
        if (type === 'azure') return AzureStorage
        throw new Error(`Unimplemented storage type ${type}`)
      })
    )

    const root = Scope.create({
      bindings: [
        Scope.bind(StorageConfig, {
          type: 'aws'
        })
      ]
    })

    const a: string = await root.get(StorageByType)
    const b: string = await root.get(StorageByType)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage'])

    const c: string = await root.get(AWSStorage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage'])

    const d: string = await root.get(AzureStorage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage', 'azure_storage'])

    expect(a).toEqual('aws_storage')
    expect(b).toEqual('aws_storage')
    expect(c).toEqual('aws_storage')
    expect(d).toEqual('azure_storage')
  })

  it('should work on dynamically created Vars', async () => {
    const calls: string[] = []

    const root = Scope.create()

    const DoSomething = (name: string) =>
      Var.thunk(() => {
        calls.push('do ' + name)
        return name
      })

    const VarA = pipe(
      Var.empty,
      Var.chain(() => DoSomething('a')),
      Var.chain(() => DoSomething('b')),
      Var.map(async (name) => {
        await Prom.sleep(200)
        return name
      })
    )

    const a: string = await root.get(VarA)

    expect(calls).toEqual(['do a', 'do b'])
    expect(a).toEqual('b')
  })

  it('should contain the correct factory function', async () => {
    const VarA = Var.of(1)

    const VarB = pipe(
      Var.empty,
      Var.chain(() => VarA)
    )

    const factory = VarB.factory
    const value = factory()

    expect(value).toBe(VarA)
  })
})

describe('Var.mapArgs', () => {
  const VarA = Var.of(1)
  const VarB = Var.of(2)
  const VarC = pipe(
    Var.tuple(VarA, VarB),
    Var.mapArgs((a, b) => a + b)
  )

  it('should spread all arguments', async () => {
    const value: number = await Scope.run(VarC)
    expect(value).toBe(3)
  })

  it('should contain the correct factory function', async () => {
    const factory = VarC.factory
    const value = await factory(1, 2)
    expect(value).toEqual(3)
  })
})

describe('Var.struct', () => {
  it('should combine a struct of vars into a single var', async () => {
    const VarA = Var.of(1)
    const VarB = Var.of(2)
    const VarC = pipe(
      Var.struct({
        a: VarA,
        b: VarB
      }),
      Var.map(({ a, b }) => a + b)
    )

    const value = await Scope.run(VarC)
    expect(value).toBe(3)
  })
})
