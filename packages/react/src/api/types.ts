// Utility types
export type Updator<R> = (data?: R) => R

export type APIParams = Record<string, unknown>
export type APIState<R> = { data?: R; loading: boolean }
export type APIPromise<R> = Promise<R> & { cancel: () => void }
