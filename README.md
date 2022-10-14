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

- [Files](packages/files) (`@apoyo/files`): Contains file drivers for most commonly used providers.

<!--
Packages that are not ready yet:

- [IOC](packages/ioc) (`@apoyo/ioc`): A simple functional dependency injector.

- [Process](packages/process) (`@apoyo/process`): Contains Nodejs process utils, such as auto-loading .env files, validating and parsing environment variables, a zero-config logger (using pino), etc...

-->

## Setup

1. Run `yarn install`
2. And you're ready !

This repository uses [PNP (Plug'n'Play)](https://yarnpkg.com/features/pnp) instead of node_modules.
As such, you may also need to install SDKs to add PNP (Plug'n'Play) support to your editor:

<https://yarnpkg.com/getting-started/editor-sdks>

**Note**: VSCode SDKs should be installed by default.

## Usage

This repository is a mono-repository managed with **yarn workspaces** for the dependencies
and **jill** for running scripts.

### Publish

The pipeline on master branch will lint, build and test each package before publishing them all.
But as we cannot publish the same version of a package twice, only package with updated version number
will be pushed to the registry.

So to publish a new version for a given package, you only have to bump up it's version number.
To bump easily you can use yarn's version plugin:

```shell
yarn workspace {package} version {bump type}
```

Where _bump type_ is one of _patch_, _minor_, _major_. This will maintain dependencies link in other packages too.

#### Example

```shell
yarn workspace @apoyo/std version path
```

This will change `@apoyo/std` version from 1.0.0 to 1.0.1 and update `@apoyo/decoders`'s package.json
because it depends on `@apoyo/std` too.

### Tasks

#### In one package

To run a script in a package use the following command:

```shell
yarn jill run -w {package} {script} -- {args ...}
```

It will first build every dependency of _package_ then run _script_ with the given _args_.

#### Example

```shell
yarn jill run -w @apoyo/decoders test
```

This will build `@apoyo/std` before running `test` script of `@apoyo/decoders`.

#### In every package

To run a task in every package use the following command:

```shell
yarn jill each {script} -- {args ...}
```

This will first build all dependency then run _script_ with the given _args_.

#### Example

```shell
yarn jill each build
```

This will build every package in "dependency" order.

For more details on **jill** options and commands please use `yarn jill --help` .

## Contributing

To setup this project locally, you will need to:

- Clone this repository.

- Install packages using `yarn install` from the root directory.

- Add new features or fixes.

- Run unit tests by running `yarn test` from root directory or from the package directly (to only run tests for a given package). In the case you added new features, you will also need to add unit tests covering these features.

- Create a Pull Request.
