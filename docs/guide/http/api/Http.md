# Http overview

## Summary

[[toc]]

## Functions

### Http.send

#### Description

Create a response that sends a given body to the client.

```ts
(body?: Json | undefined, status?: number) => any
```

### Http.redirect

#### Description

Create a response to redirect the user to another URL

```ts
(url: string, status?: number) => any
```

### Http.download

#### Description

Create a response to download a given readable stream

```ts
(stream: NodeJS.ReadableStream, fileName?: string | undefined, fileType?: string | undefined) => any
```

### Http.tryCatch

#### Description

Catches thrown `Http.Response`s and resolves them.
All other errors will not be catched!

```ts
(fn: () => any) => Promise<any>
```

### Http.Ok

```ts
(data: Json) => any
```

### Http.Created

```ts
(data: Json) => any
```

### Http.NoContent

```ts
() => any
```

### Http.BadRequest

```ts
(data?: Dict<any>) => any
```

### Http.Unauthorized

```ts
(data?: Dict<any>) => any
```

### Http.PaymentRequired

```ts
(data?: Dict<any>) => any
```

### Http.Forbidden

```ts
(data?: Dict<any>) => any
```

### Http.NotFound

```ts
(data?: Dict<any>) => any
```

### Http.MethodNotAllowed

```ts
(data?: Dict<any>) => any
```

### Http.NotAcceptable

```ts
(data?: Dict<any>) => any
```

### Http.RequestTimeout

```ts
(data?: Dict<any>) => any
```

### Http.Conflict

```ts
(data?: Dict<any>) => any
```

### Http.UnprocessableEntity

```ts
(data?: Dict<any>) => any
```

### Http.InternalError

```ts
(data?: Dict<any>) => any
```

### Http.NotImplemented

```ts
(data?: Dict<any>) => any
```

### Http.BadGateway

```ts
(data?: Dict<any>) => any
```

### Http.ServiceUnavailable

```ts
(data?: Dict<any>) => any
```

### Http.GatewayTimeout

```ts
(data?: Dict<any>) => any
```

