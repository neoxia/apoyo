# What is Apoyo?

Apoyo (Spanish for "support") tries to improve Developer Experience, by giving the developer a wide range of utility packages, from framework agnostic utilities to library overlays, to facilitate their usage.

## Motivation

Today, there exists a huge variety of utility libraries in the JS ecosystem: `underscore`, `lodash`, `ramda`, etc...

While these libraries are great, they don't fit certain needs and are missing a lot of utilities required in day by day work.

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
