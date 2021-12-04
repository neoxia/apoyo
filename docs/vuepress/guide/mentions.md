# Honorable mentions

Apoyo has been inspired by a huge number of existing packages:

**fp-ts**:

Apoyo has been heavily inspired by `fp-ts`, and has re-implemented a lot of useful concepts (Results, Tasks, Decoders, Option, Ord, pipe, etc...)

However, `fp-ts` is unfortunaly too complicated to use and doesn't always integrate well with existing code.
As such, while this library may have a few similarities, `@apoyo/std` has been heavily simplified for easier usage.

**v-error**: The `Err` module has been heavily inspired by the way you chain errors with `v-error`. However, we didn't need the "printf" style messages formatting and decided to rather use "mustache" styled messages. Apoyo's implementation also works out of the box with other custom error libraries and is easier to use.

A lot of smaller packages were also included:

**pupa**: The `Str` module a small `template` function based on this package.

**escape-goat**: The `Str` module also re-integrates the small `htmlEscape` and `htmlUnescape` functions, which have been <s>copied</s> **inspired** by this package.

**p-limit**: This library is known for it's capabilities to execute at maximum X promises at once. The `Task` module implements it's own `concurrence` and `sequence` functions, allowing you to achieve the same without this dependency.

**enum-for**: We re-used the 3 mentionned lines in our `Enum` module
