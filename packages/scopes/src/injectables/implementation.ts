import { Container } from '../container'
import { Resource } from '../resources'
import { Tuple, Fn } from '../types'
import { Injectable } from './injectable'

export namespace Implementation {
  export interface Options<Deps extends Tuple, T> {
    inject?: Injectable.ArrayOf<Deps>
    factory: Fn<Deps, T>
  }
}

export class Implementation<Args extends Tuple, T> extends Injectable<Injectable.ReturnType<T>> {
  public readonly inject?: Injectable.ArrayOf<Args>
  public readonly factory: Fn<Args, T>

  constructor(options: Implementation.Options<Args, T>) {
    super((container) => this._initialize(container))
    this.inject = options.inject
    this.factory = options.factory
  }

  private async _initialize(container: Container) {
    const res = await this._execute(container)

    if (res instanceof Injectable) {
      return container.get(res)
    }

    if (res instanceof Resource) {
      if (res.unmount) {
        container.beforeClose(res.unmount)
      }
      return res.value
    }

    return res
  }

  private async _execute(container: Container): Promise<T> {
    const deps = this.inject ?? []
    const execute = this.factory as (...args: any[]) => T

    if (deps.length === 0) {
      return execute()
    }
    if (deps.length === 1) {
      const resolved = await container.get(deps[0])
      return execute(resolved)
    }
    const args = []
    for (const dep of deps) {
      args.push(await container.get(dep))
    }
    return execute(...args)
  }
}
