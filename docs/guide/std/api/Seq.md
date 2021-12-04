# Seq overview

## Summary

[[toc]]

## Types

### Seq

```ts
type Seq<A> = Iterable<A>
```

## Functions

### Seq.of

```ts
<A>(value: A) => Seq<A>
```

### Seq.map

```ts
<A, B>(fn: (value: A) => B) => (seq: Seq<A>) => Seq<B>
```

### Seq.uniq

```ts
<A>(fn: (value: A) => string | number) => (seq: Seq<A>) => Seq<A>
```

### Seq.filter

```ts
<A, B extends A>(fn: Refinement<A, B>): (arr: Seq<A>) => Seq<B>
<A>(fn: Predicate<A>): (arr: Seq<A>) => Seq<A>
```

### Seq.range

```ts
(from: number, to: number, step?: number) => Generator<number, void, unknown>
```

### Seq.slice

```ts
(start?: number | undefined, end?: number | undefined) => <A>(seq: Seq<A>) => Seq<A>
```

### Seq.take

```ts
(nb: number) => <A>(seq: Seq<A>) => Seq<A>
```

### Seq.skip

```ts
(nb: number) => <A>(seq: Seq<A>) => Seq<A>
```

### Seq.head

```ts
<A>(seq: Seq<A>) => A | undefined
```

### Seq.last

```ts
<A>(seq: Seq<A>) => A | undefined
```

### Seq.toArray

```ts
<A>(seq: Seq<A>) => Array<A>
```

