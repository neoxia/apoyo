# Apoyo

## Description

Apoyo is a mono-repositories containing a wide range of libraries that can be used to simplify application development.

The goal was having:

- Libraries that can be used in a very similar (and uniform) way.
- Libraries covering utilities for most use-cases, without having to install tons of libraries.
- Libraries favoring composition and customability.

## Packages

- [Std](packages/std) (`@apoyo/std`): Contains general, framework agnostic utilities, such as utilities for errors, promises, async concurrency, and many others!

- [Decoders](packages/decoders) (`@apoyo/decoders`): Contains type decoders and validators.

- [Http](packages/http) (`@apoyo/http`): Contains a generic HTTP interfaces, that can easily be used with `express` or any other HTTP framework.

- [Scopes](packages/scopes) (`@apoyo/scopes`): A functional dependency injector. Contains auto-resolving of dependencies, custom scope creation, graceful scope shutdown, as well as many other unique features!

## Contributing

To setup this project locally, you will need to:

- Clone this repository.

- Install packages using `yarn install` from the root directory.

- Add new features or fixes.

- Run unit tests by running `yarn test` from root directory or from the package directly (to only run tests for a given package). In the case you added new features, you will also need to add unit tests covering these features.

- Create a Pull Request.
