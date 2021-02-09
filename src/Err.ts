export type Err<A> = Error

export const chain = (msg: string) => (err: Error) => new Error(`${msg}: ${err.message}`)

export const Err = {
  chain
}
