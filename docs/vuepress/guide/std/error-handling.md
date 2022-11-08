# Error handling

Apoyo provides functionalities to improve error handling, by providing an `Exception` class.

## Custom exceptions

This class can be used to easily create new custom errors classes, that can easily be identified by name or `instanceof`:

```ts
export class EntityNotFoundException extends Exception {
  constructor(message: string, public readonly code: string) {
    super(message)
  }
}

export class PostNotFoundException extends EntityNotFoundException {
  constructor() {
    super('Post not found', undefined, 'E_POST_NOT_FOUND')
  }
}
```

This makes it very easy for the developers using your features to identify, understand and catch the appropriate errors.

## Error causes

Most of the time, you may want to transform an error thrown by a third-party library into a custom error that you can more easily work with.

In those cases however, it is recommended to keep the original error cause, to view the entire history on how this error came to be and how to fix it:

*exceptions.ts*:

```ts
export class FileException extends Exception {
  constructor(message: string, cause: Error | undefined, public readonly code: string) {
    super(message, cause)
  }
}

export class CannotWriteFileException extends FileException {
  constructor(public readonly location: string, cause: Error) {
    super(`Cannot write file at location "${location}"`, cause, 'E_CANNOT_WRITE_FILE')
  }
}
```

*feature.ts*:

```ts
try {
  await fs.promises.writeFile(path, contents)
} catch (err) {
  throw new CannotWriteFileException(path, err)
}
```

## Usage example with HTTP

Most frameworks provide you with custom HTTP error classes or factories.

However, some people then throw these HTTP errors inside their application layer / services, which **highly couples** your entire application to the HTTP protocol / transport layer, which is **bad**.

You should instead create and throw your own, **application owned**, exceptions from your application layer. You can then catch these errors on the transport layer and transform them into their appropriate HTTP errors:

```ts
if (err instanceof NotAuthorizedException) {
  throw new HttpUnauthorizedException()
}
if (err instanceof EntityNotFoundException) {
  throw new HttpNotFoundException({
    message: err.message,
    code: err.code
  })
}
throw new HttpInternalError({
  message: 'Internal error'
})
```
