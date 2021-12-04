# IO overview

## Summary

[[toc]]

## Types

### IO

```ts
type IO<A> = () => A
```

## Functions

### IO.of

```ts
<A>(value: A) => () => A
```

### IO.reject

```ts
(value: unknown) => () => never
```

### IO.map

```ts
<A, B>(fn: (value: A) => B) => (ma: IO<A>) => IO<B>
```

### IO.mapError

```ts
(fn: (err: any) => any) => <A>(ma: IO<A>) => IO<A>
```

### IO.chain

```ts
<A, B>(fn: (value: A) => IO<B>) => (ma: IO<A>) => IO<B>
```

### IO.run

```ts
<A>(fn: IO<A>) => A
```

