# Apoyo - Std

[![npm version](https://badgen.net/npm/v/@apoyo/std)](https://www.npmjs.com/package/@apoyo/std)  
[![build size](https://badgen.net/bundlephobia/min/@apoyo/std)](https://bundlephobia.com/result?p=@apoyo/std@0.0.3)  
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/std)](https://bundlephobia.com/result?p=@apoyo/std@0.0.3)

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

`npm install @apoyo/std`

## Motivation

Today, there exists a huge variety of utility libraries in the JS ecosystem: `underscore`, `lodash`, `ramda`, etc...

While these libraries may be great, they don't fit my needs and are missing a lot of utilities I require in my day by day work.

**Pipeable**: `underscore` or `lodash` utilities are not pipeable, which means combining multiple operations requires a lot of temporary variables, which harms the code quality.

**Typescript**: None of the above tools have been written specifically for Typescript, which means some functions are hard to type or don't play nicely with Typescript at all.

**Three-shaking**: The above libraries don't have great out-of-the-box Tree-shaking capabilities.

**Content**: These libraries mainly cover utilities for `Array`s and `Record`s, whis means you will have to install other packages to cover missing utilities:

- A package for custom errors / improved error handling.
- A package for `Promise` utilities, to execute for example Promises in concurrence / in sequence
- A package to accumulate Results without throwing
- Etc...

## Goal

This library has a few main goal:

- Avoid dependency hells, by not having to install a multitude of utility packages required to do common tasks.

- Avoid any naming conflicts by putting all utilities related to a data-structure in their respective "barrel" export.

- Ease of usage: While large, the library should be easy to read and learn.

## Modules

- `Arr` containing Array utilities
- `Dict` containing Record utilities
- `Str` containing String utilities
- `Err` containing Error utilities
- `Prom` containig Promise utilities
- `Task` containing lazy Promises utilities (`type Task<A> = () => Promise<A>`)
- `Result` which can represent the failure or success of an operation (`type Result<A,E> = Ok<A> | Ko<E>`)

## Honorable mentions

**fp-ts**:

This library has been heavily inspired by `fp-ts`, and has re-implemented a lot of useful concepts (Results, Tasks, Decoders, Option, Ord, pipe, etc...)

However, `fp-ts` is unfortunaly too complicated to use and doesn't always integrate well with existing code.
As such, while this library may have a few similarities, `@apoyo/std` has been heavily simplified for easier usage.

**v-error**: The `Err` module has been heavily inspired by the way you chain errors with `v-error`. However, we didn't need the "printf" style messages formatting and decided to rather use "mustache" styled messages.

**pupa**: The `Str` module a small `template` function based on this package.

**escape-goat**: The `Str` module also re-integrates the small `htmlEscape` and `htmlUnescape` functions, which have been <s>copied</s> **inspired** by this package.

**p-limit**: This library is known for it's capabilities to execute at maximum X promises at once. The `Task` module implements it's own `concurrence` and `sequence` functions, allowing you to achieve the same without this dependency.

**enum-for**: We re-used the 3 mentionned lines in our `Enum` module

## Examples

- Chaining errors:

```ts
const users = await pipe(
  findUsers(),
  Prom.mapError(Err.chain('findUsers failed'))
)
```

- Execute `Promise`s in sequence or concurrently:

```ts
await pipe(
  tasks,
  Task.concurrent(4),
  Task.run
)
```

- Accumulate results without throwing:

```ts

const operation = (value) => {
  if (value < 0) {
    throw new Error('number should be positive')
  }
  return value
}

const [ok, ko] = pipe(
  [1,-2,3],
  Arr.map(Result.tryCatchFn(operation)),
  Arr.separate
)

expect(ok).toEqual([1,3])
expect(ko).toEqual([-2])
```

- And more...
