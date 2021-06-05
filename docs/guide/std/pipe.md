# Pipe

## Introduction

Today, there is no operator in Typescript to allow us to easily chain multiple operations together.

We could inline our functions, but this quickly becomes hard to read:

```ts
console.log(exclaim(sayHello('Chuck'))) // logs 'Hello Chuck!'
```

We could use variables to split our operations into multiple parts:

```ts
const helloChuck = sayHello('Chuck')
const exclaimMsg = exclaim(helloChuck)
console.log(exclaimMsg) // logs 'Hello Chuck!'
```

But this requires the creation of temporary / unnecessary variables, which give more room for errors to occur, and makes the code more verbose for no reason.

Now here what this would look like with a `pipe` function:

```ts
import { pipe } from '@apoyo/std'

const sayHello = (name: string) => `Hello ${name}`
const exclaim = (str: string) => `${str}!`

pipe(
  'Chuck', // initial value
  sayHello, // action A
  exclaim, // action B
  console.log // logs 'Hello Chuck!'
)
```

We managed to remove unecessary variables and can easily be extended to compute more complicated results.

**Note**: To assure better typing, the `pipe` function takes an initial value as the first parameter.

## Usage

The first argument of `pipe` is the initial value `A`.<br/>
The next argument is optional and a function of type `(value: A) => B`.<br/>
The next argument is optional and a function of type `(value: B) => C`.<br/>
And once again, the next argument is optional and a function of type `(value: C) => D`.<br/>
And so forth...

## Flow

There is a very similar function to `pipe` called `flow`.<br/>
The main difference is that it doesn't take an initial value as the first parameter.<br/>
It instead composes functions together and returns a function taking this initial value.

```ts
const greet = flow(sayHello, exclaim, console.log)

greet('Chuck') // logs 'Hello Chuck!'
```

In this case, the argument of the first function **MUST** be typed correctly.
