import type { Provider } from './provider'

export type Tuple<T = any> = [T, ...T[]] | [...any[]]

export type NoInfer<T> = T extends infer S ? S : never

export type Fn<Args extends any[], T> = (...args: NoInfer<Args>) => Provider.ReturnType<T>

export type Type<T, Args extends Tuple> = { new (...args: Args): T }
