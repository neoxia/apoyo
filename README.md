# Apoyo

## Motivations

Today, in the NodeJS world, it is hard to find libraries that contain abstractions with multiple implementations / drivers. It is even harder to find one that is not tied to a specific framework.
Most of the time, this forces developers to write these abstractions themselves.

Let's say we need to download / upload files in our application, we will need to think about the required abstractions, write and test our implementation(s) based on the provider of our choice (ex: AWS S3), etc...

Apoyo's goal is to improve developer experience by providing **simple** abstractions, as well as most commonly used implementations for them.
Simply add the driver you need and that's it:

```ts
import { Drive } from '@apoyo/files'
import { S3Drive } from '@apoyo/files-s3'

const drive: Drive = new S3Drive({ ... })

const content = await drive.get('path/to/file.txt')
```

## Features

Here a list of features that Apoyo covers:

- **Configuration**: Load configuration parameters from environment, AWS Parameter Store, etc...

- **File drivers**: Upload and download files for most commonly used providers, such as AWS S3, GCS and Azure Blobs

- **Authorization**: Use policies to define your business authorization logic in a more consistent way.

- **IoC**: Use a simple and fully type-safe IoC container without polluting your code with decorators.

- And more incoming, like mailer abstractions, etc...

Apoyo also contains some original libraries to help with other common problems.

**Note**: Each library can be used **independently** of each other, and is fully **framework agnostic**.
Install only the libraries you need and use!

## Packages

Before using a package, check if the version is ^1.0.0. If not, the package is still under development and may still change. Use package below version 1.0.0 at your own risk.

- [Std](packages/std) (`@apoyo/std`): Contains general, framework agnostic utilities, such as utilities for errors, promises, async concurrency, and many others!

- [Decoders](packages/decoders) (`@apoyo/decoders`): Contains type decoders and validators.

- [Config](packages/config) (`@apoyo/config`): Contains utils to help you configure your application.

- [Files](packages/files) (`@apoyo/files`): Contains file drivers for most commonly used providers.

- [Policies](packages/policies) (`@apoyo/policies`): Contains utils to better separate and write authorization logic.

- [IoC](packages/ioc) (`@apoyo/ioc`): Contains a fully type-safe IoC container (no decorators).

## Contributing

This repository is a mono-repository managed with **yarn workspaces** for the dependencies
and **jill** for running scripts.

To setup this project locally, you will need to:

- Clone this repository.

- Install packages using `yarn install` from the root directory.

- Add new features or fixes.

- Run unit tests by running `yarn test` from root directory or from the package directly (to only run tests for a given package). In the case you added new features, you will also need to add unit tests covering these features.

- Create a Pull Request.

### Setup

1. Run `yarn install`
2. And you're ready !

This repository uses [PNP (Plug'n'Play)](https://yarnpkg.com/features/pnp) instead of node_modules.
As such, you may also need to install SDKs to add PNP (Plug'n'Play) support to your editor:

<https://yarnpkg.com/getting-started/editor-sdks>

**Note**: VSCode SDKs should be installed by default.

### Publish

The **pipeline** on master branch will lint, build and test each package before publishing them all.
But as we cannot publish the same version of a package twice, only package with updated version number will be pushed to the registry.

So to publish a new version for a given package, you only have to bump up it's version number.
To bump easily you can use yarn's version plugin:

```shell
yarn workspace {package} version {bump type}
```

Where _bump type_ is one of _patch_, _minor_, _major_. This will maintain dependencies link in other packages too.

#### Example

```shell
yarn workspace @apoyo/ioc version path
```

This will change `@apoyo/ioc` version from 1.0.0 to 1.0.1 and update `@apoyo/stc`'s package.json because it depends on `@apoyo/ioc` too.

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
