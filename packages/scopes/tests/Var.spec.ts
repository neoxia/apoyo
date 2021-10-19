import { pipe, Prom, Result } from '@apoyo/std'
import { Scope, Var } from '../src'

describe('Var.thunk', () => {
  it('should create a constant', async () => {
    let calls = 0
    const VarA = Var.thunk(() => {
      ++calls
      return 1
    })

    const root = pipe(Scope.create(), Scope.get)

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

    const root = pipe(Scope.create(), Scope.get)
    const child = pipe(
      Scope.childOf({
        scope: root,
        variable: Var.of(0)
      }),
      Scope.get
    )

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

    const root = pipe(Scope.create(), Scope.get)

    const a = await root.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })

  it('should always create a constant on root level', async () => {
    const VarA = Var.of(1)

    const root = pipe(Scope.create(), Scope.get)
    const child = pipe(
      Scope.childOf({
        scope: root,
        variable: Var.of(0)
      }),
      Scope.get
    )

    const a = await child.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual(1)
    expect(b).toEqual(1)
  })
})

describe('Var.lazy', () => {
  it('should allow lazy import', async () => {
    const VarA = Var.lazy(() => import('./utils/mocks').then((i) => i.LazyVar))

    const root = pipe(Scope.create(), Scope.get)

    const a = await root.get(VarA)
    const b = await root.get(VarA)

    expect(a).toEqual('lazy')
    expect(b).toEqual('lazy')
  })
})

describe('Var.abstract', () => {
  it('should throw by default', async () => {
    const CurrentStorage = Var.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')

    const root = pipe(Scope.create(), Scope.get)

    const err = await pipe(root.get(CurrentStorage), Prom.tryCatch)

    expect(pipe(err, Result.isKo)).toBe(true)
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

    const CurrentStorage = Var.abstract<{ type: 'aws' | 'azure' }>('CurrentStorage')

    const StorageType = pipe(
      CurrentStorage,
      Var.map((lake) => {
        calls.push('storage_type')
        return lake.type
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

    const root = pipe(Scope.create(), Scope.get)

    const child = pipe(
      Scope.childOf({
        scope: root,
        variable: Var.of(0)
      }),
      Scope.bind(CurrentStorage, {
        type: 'aws'
      }),
      Scope.get
    )

    const a = await child.get(StorageByType)
    const b = await child.get(StorageByType)
    const c = await root.get(AWSStorage)

    expect(calls).toEqual(['storage_type', 'storage_by_type', 'env', 'aws_storage'])
    expect(a).toEqual('aws_storage')
    expect(b).toEqual('aws_storage')
    expect(c).toEqual('aws_storage')
  })

  it('should work on dynamically created Vars', async () => {
    const calls: string[] = []

    const root = pipe(Scope.create(), Scope.get)

    const DoSomething = (name: string) =>
      Var.thunk(() => {
        calls.push('do ' + name)
        return name
      })

    const VarA = pipe(
      Var.inject(),
      Var.chain(() => DoSomething('a')),
      Var.chain(() => DoSomething('b')),
      Var.map(async (name) => {
        await Prom.sleep(200)
        return name
      })
    )

    const a = await root.get(VarA)

    expect(calls).toEqual(['do a', 'do b'])
    expect(a).toEqual('b')
  })
})

describe('Var.mapWith', () => {
  it('should spread all arguments', async () => {
    const VarA = Var.of(1)
    const VarB = Var.of(2)
    const VarC = pipe(
      Var.inject(VarA, VarB),
      Var.mapWith((a, b) => a + b)
    )

    const value = await pipe(Scope.create(), Scope.run(VarC))
    expect(value).toBe(3)
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

    const value = await pipe(Scope.create(), Scope.run(VarC))
    expect(value).toBe(3)
  })
})
