# Apoyo - Scopes

[![npm version](https://badgen.net/npm/v/@apoyo/scopes)](https://www.npmjs.com/package/@apoyo/scopes)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/scopes)](https://bundlephobia.com/result?p=@apoyo/scopes)
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/scopes)](https://bundlephobia.com/result?p=@apoyo/scopes)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/decoders`

## Motivation

Today, a lot of solutions exists for dependency injection in JS/TS, the most popular solutions being:

- Typedi
- Inversify
- Nestjs
- etc...

Here however a few issues:

- They are mostly used with classes and decorators

- They don't support custom scopes creation: Most only have a singleton scope, transient scope and maybe request scope

- Most of them don't have a clear shutdown mechanism, to gracefully shutdown the services

## Goal

This package is a more functional based dependency injection solution, with the following characteristics:

- Without classes / decorators: This encourages better code splitting, and makes it a lot easier to expose primitives, async values, functions, etc... instead of mostly class instances only.

- Typescript friendly

- Custom scopes: You will have complete control over how many scopes and child scopes you create. This makes it very easy to create, for example, a separate scope for each "Job", containing the data of the job that is being currently processed.

- Lazy loading of dependencies: If your application contains hundreds of services... why should we startup them all up if only a handful are needed on program startup.

- Powerful scope shutdown mechanism

- Easier testability

## Documentation

Please visit the [documentation](https://nx-apoyo.netlify.app/guide/decoders/getting-started.html) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
