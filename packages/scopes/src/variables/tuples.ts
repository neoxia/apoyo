import { pipe } from '@apoyo/std'
import { all } from './array'
import { chain, factory, map } from './core'
import { Var } from './core'

export function tuple(): Var<[]>
export function tuple<A>(a: Var<A>): Var<[A]>
export function tuple<A, B>(a: Var<A>, b: Var<B>): Var<[A, B]>
export function tuple<A, B, C>(a: Var<A>, b: Var<B>, c: Var<C>): Var<[A, B, C]>
export function tuple<A, B, C, D>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>): Var<[A, B, C, D]>
export function tuple<A, B, C, D, E>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>, e: Var<E>): Var<[A, B, C, D, E]>
export function tuple<A, B, C, D, E, F>(
  a: Var<A>,
  b: Var<B>,
  c: Var<C>,
  d: Var<D>,
  e: Var<E>,
  f: Var<F>
): Var<[A, B, C, D, E, F]>
export function tuple(...vars: Var[]): Var<any[]> {
  return all(vars)
}

export const mapArgs = <A extends any[], B>(fn: (...args: A) => B | PromiseLike<B>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      map((args) => fn(...args))
    )
  )

export const chainArgs = <A extends any[], B>(fn: (...args: A) => Var<B> | PromiseLike<Var<B>>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      chain((args) => fn(...args))
    )
  )
