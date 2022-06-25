export type Tuple<T = any> = [T, ...T[]] | [...any[]]

export type NoInfer<T> = T extends infer S ? S : never

export type Fn<Args extends any[], Type> = (...args: NoInfer<Args>) => Type
