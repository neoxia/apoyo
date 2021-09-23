# Apoyo - Http

[![npm version](https://badgen.net/npm/v/@apoyo/http)](https://www.npmjs.com/package/@apoyo/std)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/http`

## Motivation

A multitude of solutions exists to more easily throw HTTP Errors, like `@hapi/boom`, etc...

However, that is where they stop. They don't offer a general `Response` interface you can use for most use-cases.

This library exposes generic HTTP response interfaces, usable with any framework or library, as well as a bunch of utilities to create all possible responses cleanly and easily.

## Response types

In this library, a `Http.Response` can take 4 forms:

### Http Results

Most of the time, your response will be a simple `Http.Result`, which contains a normal `body` / content that needs to be send to the client:

- This may be text or json.
- This may be an HTTP error or not.

```ts
const GetTodos = withExpress(async (req: Express.Request) => {
  if (!req.user) {
    throw Http.Unauthorized()
  }
  const todos = []
  return Http.Ok(todos)
})
```

**Note**: You will need to create a "wrapper", which transforms your function into a HTTP Handler that your framework can support.

*Example with express*:

```ts
const withExpress = (fn: (req: Express.Request) => Http.Response | Promise<Http.Response>) => {
  return async (req: Express.Request, res: Express.Response) => {
    const response = await pipe(
      Http.tryCatch(() => fn(req)),
      Prom.catchError(err => Prom.resolve(Http.InternalError({
        cause: process.env.NODE_ENV === 'production' ? undefined : err
      })))
    )

    // Handle Response.Callback
    if (typeof response.type === 'function') {
      return response(res)
    }

    res.status(response.status)
    res.set(response.headers)

    // Handle Response.Result
    if (response.type === ResponseType.Result) {
      if (response.body === undefined || typeof response.body === 'string') {
        return res.send(response.body)
      } else {
        return res.json(response.body)
      }
    }
    // Handle Response.Redirect
    if (response.type === ResponseType.Redirect) {
      return res.redirect(response.url)
    }
    // Handle Response.Stream
    if (response.type === ResponseType.Stream) {
      return response.stream.pipe(res)
    }
  }
}
```

**Note**: This is a very simple adapter, and you may need to change it to better suit your use-case and allow better configurability.

### Http redirections

Sometimes, you need to redirect the user to another page.
You can use the `Http.Redirect` type for those situations.

```ts
const Home = withExpress(async (req: Express.Request) => {
  if (!req.user) {
    throw Http.redirect('/login')
  }
  return Http.send(`<div>Home</div>`)
})
```

### Http streams

Sometimes, it is also necessary to stream data to the client. In that case, you can use the type `Http.Stream`, which contains a `ReadableStream` to stream to your client.

```ts
const DownloadExample = withExpress(async (req: Express.Request) => {
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

### Native callbacks

In the case no abstraction exists for what you need, you can use an `Http.Callback`, which is simply a function, taking as a parameter the native `Response` from your library.

```ts
const Home = withExpress(async (req: Express.Request) => {
  // Bad, as you can use `return Http.send('Bad')` instead
  return (res: Express.Response) => {
    res.status(200).send('Bad')
  }
})
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
