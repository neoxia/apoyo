# Async utils

`@apoyo/std` contains a lot of utilities to handle commonly used asynchroneous tasks.

## Promise module

By default, the `Prom` namespace will contain utilities about `Promise`s.

It will contain useful utilities like:

- `thunk` to wrap an synchroneous or asynchroneous operation into a promise.
- `mapError` to map over the rejected error of the promise.
- `tryCatch` to encapsulate your resolved / rejected value into a `Result` (`Ok` if resolved, or `Ko` if rejected)
- `timeout` to timeout your promise
- etc...

## Task module

As a `Promise` is eager and will directly be executed, you may sometimes rather use `Task`s, who are the lazy equivalent of a `Promise`.

This allows a multitude of operations that are not possible with `Promise`s, like executing a list of asynchroneous tasks in sequence or in concurrency.
