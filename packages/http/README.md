# Apoyo - Std

[![npm version](https://badgen.net/npm/v/@apoyo/http)](https://www.npmjs.com/package/@apoyo/std)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/http)](https://bundlephobia.com/result?p=@apoyo/std)

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

`npm install @apoyo/http`

## Motivation

A multitude of solutions exists to more easily throw HTTP Errors, like `@hapi/boom`, etc...

However, that is where they stop. They don't offer a general `Response` interface you can use for most use-cases.

This library exposes generic HTTP response interfaces, usable with any framework or library, as well as a bunch of utilities to create all possible responses cleanly and easily.

In this library, a `Http.Response` can take a lot of forms:

- `Http.Result`, which contains a normal `body` / content that needs to be send to the client:
  - This may be text or json.
  - This may be an HTTP error or not.

```ts
/*
 * `Route.handler` may be any function you write, that takes a function of type `(req: any) => Http.Response | Promise<Http.Response>` and transforms it into a request handler for your HTTP library.
 */
const GetTodos = Route.handler(async (req) => {
  if (!req.user) {
    throw Http.Unauthorized()
  }
  const todos = []
  return Http.Ok(todos)
})
```

- `Http.Redirect`, which contains data to redirect the user to a given page.
  - This may not be supported by your library (ex: AWS Lambda). In this case you should throw and return and error to your user.

```ts
const Home = Route.handler(async (req) => {
  if (!req.user) {
    throw Http.redirect('/login')
  }
  return Http.send(`<div>Home</div>`)
})
```

- `Http.Stream`, which contains a `ReadableStream` to stream to your client.
  - This may not be supported by your library (ex: AWS Lambda). In this case you should throw and return and error to your user.

```ts
const Home = Route.handler(async (req) => {
  // Build your response from the ground up:
  return pipe(
    Response.status(200),
    Response.header('Content-Disposition', 'attachment; filename="filename.png'),
    Response.header('Content-Type', 'image/png'),
    Response.stream(yourFileStream)
  )

  // Or use the shorthand utility:
  return Http.download(yourFileStream, 'filename.png', 'image/png')
})
```

- `Http.Callback`, which is simply a function, taking as a parameter the native `Response` from your library. This should only be used if no other solutions exist.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
