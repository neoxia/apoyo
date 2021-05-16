import { Arr, Err, pipe } from '@apoyo/std'
import { Service } from './Service'

export type Container = {
  bindings: Map<Service.Factory, Service.Binding>
  services: Map<Service.Factory, Service>
}

export type ContainerOptions = {
  bindings?: Service.Binding[]
  services: Service.Factory[]
}

export const getBindingOf = <T>(container: Container, factory: Service.Factory<T>): Service.Factory<T> => {
  const binding = container.bindings.get(factory) as Service.Factory<T> | undefined
  if (binding) {
    return getBindingOf(container, binding)
  }
  return factory
}

export const getInterfaceOf = <T>(
  container: Container,
  factory: Service.Factory<T>
): Service.Factory<T> | undefined => {
  if (Service.isBinding(factory)) {
    return getInterfaceOf(container, factory.implements)
  }
  return undefined
}

export const bootstrap = async (options: ContainerOptions): Promise<Container> => {
  const bindings = pipe(
    options.bindings || [],
    Arr.map((b) => [b.implements, b] as const)
  )

  const container: Container = {
    bindings: new Map(bindings),
    services: new Map()
  }

  try {
    for (const service of options.services) {
      await Service.mount(container, service)
    }
  } catch (err) {
    await destroy(container)
    throw pipe(err, Err.chain(`An error occured while bootstrapping the container`))
  }
  return container
}

export const findService = <T>(container: Container, factory: Service.Factory<T>): Service<T> | undefined =>
  container.services.get(getBindingOf(container, factory)) as Service<T> | undefined

export const find = async <T>(app: Container, setup: Service.Factory<T>) => {
  const service = findService(app, setup)
  if (!service) {
    throw Err.of(`Could not find service "${setup.name}". Are you sure this service has been loaded?`)
  }
  if (!service.body) {
    throw Err.of(`This service has been created, but has not finished loading yet.`)
  }
  return service.body as Promise<T>
}

export const destroy = async (container: Container): Promise<void> => {
  try {
    const root = pipe(
      Arr.from(container.services.values()),
      Arr.filter((service) => service.dependents.length === 0)
    )
    for (const service of root) {
      await Service.unmountDeep(service)
    }
  } catch (err) {
    throw pipe(err, Err.chain(`An error occured while shutting down the container`))
  }
}

export const Container = {
  getBindingOf,
  getInterfaceOf,
  bootstrap,
  destroy,
  findService,
  find
}
