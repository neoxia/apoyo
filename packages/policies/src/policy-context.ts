export interface PolicyContext<User = unknown> {
  getCurrentUser(options: { allowGuest: boolean }): User | null
}

export namespace PolicyContext {
  export type UserType<T extends PolicyContext<unknown>> = T extends PolicyContext<infer A> ? A : never
}
