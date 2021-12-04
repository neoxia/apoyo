# Response overview

## Summary

[[toc]]

## Types

### ResponseType

```ts
enum ResponseType {
  RESULT = 'http.result',
  REDIRECT = 'http.redirect',
  STREAM = 'http.stream',
  CALLBACK = 'http.callback',
  NEXT = 'http.next'
}
```

### Response

```ts
type Response = Response.Result | Response.Redirect | Response.Stream | Response.Callback | Response.Next
```

### Response.Open

```ts
interface Open {
    status: number
    headers: Dict
  }
```

### Response.Result

```ts
interface Result extends Open {
    type: ResponseType.RESULT
    body?: Json
  }
```

### Response.Redirect

```ts
interface Redirect extends Open {
    type: ResponseType.REDIRECT
    url: string
  }
```

### Response.Stream

```ts
interface Stream extends Open {
    type: ResponseType.STREAM
    stream: NodeJS.ReadableStream
  }
```

### Response.Next

```ts
interface Next {
    type: ResponseType.NEXT
  }
```

### Response.Callback

```ts
interface Callback {
    type: ResponseType.CALLBACK
    callback: (...args: any[]) => void
  }
```

## Functions

### Response.isResponse

```ts
(input: any) => input is Response
```

### Response.isResult

```ts
(input: Response) => input is Response.Result
```

### Response.isNext

```ts
(input: Response) => input is Response.Next
```

### Response.status

```ts
(status: number) => Response.Open
```

### Response.send

```ts
(body?: Json | undefined) => (res: Response.Open) => Response.Result
```

### Response.header

```ts
(name: string, value: string) => (res: Response.Open) => Response.Open
```

### Response.redirect

```ts
(url: string) => (res: Response.Open) => Response.Redirect
```

### Response.stream

```ts
(readable: NodeJS.ReadableStream) => (res: Response.Open) => Response.Stream
```

### Response.callback

```ts
(fn: (...args: Array<any>) => any) => Response.Callback
```

### Response.next

```ts
() => Response.Next
```

### Response.match

```ts
<T>(cases:     Result: (value: Response.Result) => T
Redirect: (value: Response.Redirect) => T
Stream: (value: Response.Stream) => T
Callback: (value: Response.Callback) => T
Next: () => T
) => (res: Response) => T
```

