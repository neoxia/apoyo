export type IO<A> = () => A

export const of = <A>(value: A) => () => value

export const map = <A, B>(fn: (value: A) => B) => (ma: IO<A>): IO<B> => () => fn(ma())
export const mapError = (fn: (err: any) => any) => <A>(ma: IO<A>): IO<A> => () => {
  try {
    return ma()
  } catch (err) {
    return fn(err)
  }
}

export const chain = <A, B>(fn: (value: A) => IO<B>) => (ma: IO<A>): IO<B> => () => fn(ma())()

export const run = <A>(fn: IO<A>) => fn()

export const IO = {
  of,
  map,
  mapError,
  chain,
  run
}
