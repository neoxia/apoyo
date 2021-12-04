# Error handling

Errors can be sometimes difficult to handle, especially if you are deep in your "domain" code.
In those cases, if an error is thrown in one of your methods / functions, it becomes difficult to know **why**, and **from where exactly** that error was thrown.

As such, `@apoyo/std` integrates a solution similar to Joyent's [v-error](https://www.npmjs.com/package/verror) approach.

I recommend you the following article from Joyent about why this approach is useful:

<https://www.joyent.com/node-js/production/design/errors>

## Error module

In `@apoyo/std`, the `Err` module provides functions similar to those available in `v-error`, but with mustache-styled messages and more easily chainable errors.

TODO: utils + examples

## Result module

Sometimes, you don't want to throw errors, but accumulate them.

In this case, the `Result` module will allow you to do multiple things:

- Catch errors an wrap them in a `Ko` object.
- Accumulate a list of errors, when executing logic that may throw on a list of elements.
- Type your errors.

TODO: examples
