import { Arr, Dict, Err, pipe, Prom, Task } from '@apoyo/std'
import { Container } from './Container'

const enum Tags {
  ServiceResult = 'Service.Result'
}

export type Service<T = unknown> = {
  container: Container
  factory: Service.Factory<T>
  dependencies: Service[]
  dependents: Service[]
  onDestroy?: Task<void>
  body?: Promise<T>
}

export const enum ServiceErrors {
  InitError = 'ServiceInitError',
  DestroyError = 'ServiceDestroyError'
}

export namespace Service {
  export type TypeOf<T extends Service.Factory> = T extends Service.Factory<infer A> ? A : never

  export interface Result<T> {
    _tag: Tags.ServiceResult
    value: T
    onDestroy?: Task<void>
  }

  export type Return<T> = Promise<Result<T>> | Promise<T> | Result<T> | T

  export interface Factory<T = any, Args extends any[] = any[]> {
    name: string
    dependencies: Factory[]
    factory: (...args: Args) => Return<T>
  }

  export interface Binding<T = any> extends Factory<T> {
    implements: Factory<T>
  }
}

export function factory<T>(name: string, dependencies: [], fn: () => Service.Return<T>): Service.Factory<T, []>
export function factory<A, T>(
  name: string,
  dependencies: [Service.Factory<A>],
  fn: (a: A) => Service.Return<T>
): Service.Factory<T, [A]>
export function factory<A, B, T>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>],
  fn: (a: A, b: B) => Service.Return<T>
): Service.Factory<T, [A, B]>
export function factory<A, B, C, T>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>],
  fn: (a: A, b: B, c: C) => Service.Return<T>
): Service.Factory<T, [A, B, C]>
export function factory<A, B, C, D, T>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>, Service.Factory<D>],
  fn: (a: A, b: B, c: C, d: D) => Service.Return<T>
): Service.Factory<T, [A, B, C, D]>
export function factory<A, B, C, D, E, T>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>, Service.Factory<D>, Service.Factory<E>],
  fn: (a: A, b: B, c: C, d: D, e: E) => Service.Return<T>
): Service.Factory<T, [A, B, C, D, E]>
export function factory<A, B, C, D, E, F, T>(
  name: string,
  dependencies: [
    Service.Factory<A>,
    Service.Factory<B>,
    Service.Factory<C>,
    Service.Factory<D>,
    Service.Factory<E>,
    Service.Factory<F>
  ],
  fn: (a: A, b: B, c: C, d: D, e: E, f: F) => Service.Return<T>
): Service.Factory<T, [A, B, C, D, E, F]>
export function factory(
  name: string,
  dependencies: Service.Factory[],
  fn: (...args: unknown[]) => Service.Return<unknown>
): Service.Factory {
  return {
    name,
    dependencies,
    factory: fn
  }
}

export const abstract = <T>(name: string): Service.Factory<T> =>
  factory<T>(name, [], () => Prom.reject(Err.of(`Service "${name}" has not been implemented`)))

export function combine<A>(name: string, dependencies: [Service.Factory<A>]): Service.Factory<[A]>
export function combine<A, B>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>]
): Service.Factory<[A, B]>
export function combine<A, B, C>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>]
): Service.Factory<[A, B, C]>
export function combine<A, B, C, D>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>, Service.Factory<D>]
): Service.Factory<[A, B, C, D]>
export function combine<A, B, C, D, E>(
  name: string,
  dependencies: [Service.Factory<A>, Service.Factory<B>, Service.Factory<C>, Service.Factory<D>, Service.Factory<E>]
): Service.Factory<[A, B, C, D, E]>
export function combine<A, B, C, D, E, F>(
  name: string,
  dependencies: [
    Service.Factory<A>,
    Service.Factory<B>,
    Service.Factory<C>,
    Service.Factory<D>,
    Service.Factory<E>,
    Service.Factory<F>
  ]
): Service.Factory<[A, B, C, D, E, F]>
export function combine(name: string, dependencies: Service.Factory[]): Service.Factory
export function combine(name: string, dependencies: Service.Factory[]): Service.Factory {
  return {
    name,
    dependencies,
    factory: (...args) => args
  }
}

export const constant = <T>(name: string, value: T): Service.Factory<T, []> => factory(name, [], () => value)

export const pluck = <T extends object, U extends keyof T>(
  factory: Service.Factory<T>,
  key: U
): Service.Factory<T[U]> => Service.factory(`${factory.name}.${key}`, [factory], (value) => value[key])

export const pluckAll = <T extends object>(
  factory: Service.Factory<T>
): {
  [P in keyof T]: Service.Factory<T[P]>
} => {
  const target: Dict<Service.Factory> = {}
  const proxy = new Proxy(target, {
    get(target, prop: string) {
      const plucked = target[prop]
      if (plucked) {
        return plucked
      }
      target[prop] = pluck(factory, prop as keyof T)
      return target[prop]
    }
  })
  return proxy as any
}

export const bind = <T, U extends T>(from: Service.Factory<T>, to: Service.Factory<U>): Service.Binding<T> => ({
  ...to,
  implements: from
})

export const result = <T>(value: T, options: { onDestroy?: Task<void> } = {}): Service.Result<T> => ({
  _tag: Tags.ServiceResult,
  value,
  onDestroy: options.onDestroy
})

export const isBinding = <T>(factory: Service.Factory<T>): factory is Service.Binding<T> =>
  (factory as any).implements !== undefined

export const isResult = <T>(factory: T | Service.Result<T>): factory is Service.Result<T> =>
  (factory as any)._tag === Tags.ServiceResult

export const isDependencyRegistered = (parent: Service, dependency: Service) =>
  !!parent.dependencies.find((d) => d === dependency)

export const isInitError = Err.hasName(ServiceErrors.InitError)

export const getLabel = (service: Service) => {
  const implFactory = service.factory
  const interfaceFactory = Container.getInterfaceOf(service.container, implFactory)
  return interfaceFactory ? `${implFactory.name} (implements ${interfaceFactory.name})` : implFactory.name
}

export const getLatestPath = (service: Service): string => {
  const label = getLabel(service)
  const parent = pipe(service.dependents, Arr.last)
  return parent ? `${getLatestPath(parent)} → ${label}` : `<root> → ${label}`
}

export const createInitError = (service: Service, err: unknown) => {
  if (isInitError(err)) {
    return err
  }
  const component = service.factory
  const path = getLatestPath(service)
  const message = `Could not initialize service "${component.name}" at ${path}`
  return pipe(
    err,
    Err.chain(message, {
      name: ServiceErrors.InitError
    })
  )
}

export const create = <T>(container: Container, factory: Service.Factory<T>, parent?: Service): Service<T> => {
  const bound = Container.getBindingOf(container, factory)
  if (bound !== factory) {
    return create(container, bound, parent)
  }

  const existing = container.services.get(factory) as Service<T> | undefined
  if (existing) {
    if (parent && !isDependencyRegistered(parent, existing)) {
      parent.dependencies.push(existing)
      existing.dependents.push(parent)
    }
    return existing
  }

  const module: Service<T> = {
    container: container,
    factory: factory,
    dependencies: [],
    dependents: []
  }

  if (parent) {
    parent.dependencies.push(module)
    module.dependents.push(parent)
  }
  container.services.set(factory, module)

  for (const dep of factory.dependencies) {
    create(container, dep, module)
  }

  return module
}

export const instantiate = async <Args extends any[], T>(factory: Service.Factory<T, Args>, ...args: Args) => {
  const data = await factory.factory(...args)
  return isResult(data) ? data : Service.result(data)
}

export const get = <T>(service: Service<T>): Promise<T> => {
  if (service.body) {
    return service.body
  }
  const factory = service.factory
  service.body = pipe(
    service.dependencies,
    Arr.map(get),
    Prom.all,
    Prom.chain(async (deps) => {
      const result = await instantiate(factory, ...deps)
      service.onDestroy = result.onDestroy
      return result.value
    }),
    Prom.mapError((err) => createInitError(service, err))
  )
  return service.body
}

export const mount = async <T>(container: Container, factory: Service.Factory<T>, parent?: Service): Promise<T> =>
  pipe(create(container, factory, parent), get)

export const unmount = async (service: Service) => {
  try {
    if (service.dependents.length > 0) {
      throw Err.of(`Cannot unmount service with dependents. Please unmount the dependents first`)
    }
    if (service.body) {
      await Prom.tryCatch(service.body)
      service.body = undefined
    }
    if (service.onDestroy) {
      await service.onDestroy()
      service.onDestroy = undefined
    }
    for (const dep of service.dependencies) {
      dep.dependents = dep.dependents.filter((parent) => parent !== service)
    }
    service.container.services.delete(service.factory)
  } catch (err) {
    throw pipe(
      err,
      Err.chain(`Could not unmount service "${service.factory.name}"`, {
        name: ServiceErrors.DestroyError
      })
    )
  }
}

export const unmountDeep = async (module: Service) => {
  await unmount(module)
  const unused = module.dependencies.filter((d) => d.dependents.length === 0)
  for (const dep of unused) {
    await unmountDeep(dep)
  }
}

export const Service = {
  factory,
  abstract,
  constant,
  combine,
  pluck,
  pluckAll,
  bind,
  result,

  isBinding,
  isDependencyRegistered,
  getLabel,
  getLatestPath,

  create,
  get,
  instantiate,
  mount,
  unmount,
  unmountDeep
}
