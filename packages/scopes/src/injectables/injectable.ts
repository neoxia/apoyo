import { Container } from '../container'
import { Ref } from '../refs'
import { Resource } from '../resources'
import { Tuple } from '../types'

export namespace Injectable {
  export type ReturnType<T> = T extends PromiseLike<infer I>
    ? ReturnType<I>
    : T extends Injectable<infer I>
    ? ReturnType<I>
    : T extends Resource<infer I>
    ? I
    : T

  export type ArrayOf<Deps extends Tuple> = Deps extends []
    ? []
    : {
        [Index in keyof Deps]: Injectable<Deps[Index]>
      } & { length: Deps['length'] }
}

export class Injectable<T = unknown> {
  constructor(public readonly initialize: (container: Container) => Promise<T>, public readonly ref = Ref.create()) {}
}
