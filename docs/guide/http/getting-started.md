# Getting started

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

In this library, a `Http.Response` can take multiple forms:

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
export const withExpress = (fn: (req: Express.Request) => Http.Response | Promise<Http.Response>) => {
  return async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const response = await pipe(
      Http.tryCatch(() => fn(req)),
      Prom.catchError((err) =>
        Prom.resolve(
          Http.InternalError({
            cause: process.env.NODE_ENV === 'production' ? undefined : err
          })
        )
      )
    )

    pipe(
      response,
      Response.match({
        Result: (response) => {
          res.status(response.status)
          res.set(response.headers)
          if (response.body === undefined || typeof response.body === 'string') {
            res.send(response.body)
          } else {
            res.json(response.body)
          }
        },
        Redirect: (response) => {
          res.status(response.status)
          res.set(response.headers)
          res.redirect(response.url)
        },
        Stream: (response) => {
          res.status(response.status)
          res.set(response.headers)
          pipeline(response.stream, res, (err) => {
            if (err) {
              res.end()
            }
          })
        },
        Callback: (response) => response.callback(res),
        Next: () => next()
      })
    )
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

### Next

Most frameworks support in one way or another middlewares. If you don't wish to return a definite response in the current handler, you can use `Http.next`, to continue to the next handler:

```ts
const isAdmin = withExpress(async (req: Express.Request) => {
  const result = await hasProfile(req.user, UserProfile.ADMIN)
  if (!result) {
    throw Http.Forbidden()
  }
  return Http.next()
})
```

### Native callbacks

You can also return an `Http.Callback`, which is simply a function, taking as a parameter the native `Response` from your library.

**Note**: This should only be used for edge-cases, in situation in which no abstraction exists for what you need.

```ts
const Home = withExpress(async (req: Express.Request) => {
  // Bad, as you can use `return Http.send('Bad')` instead
  return Http.callback((res: Express.Response) => {
    res.status(200).send('Bad')
  })
})
```
