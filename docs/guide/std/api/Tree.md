# Tree overview

## Summary

[[toc]]

## Types

### Tree

```ts
interface Tree<A> {
  readonly value: A
  readonly forest: Tree<A>[]
}
```

## Functions

### Tree.of

#### Description

Create a new tree branch

```ts
<A>(value: A, forest?: Array<Tree<A>>) => Tree<A>
```

### Tree.draw

#### Description

Draw the `Tree` of strings

```ts
(tree: Tree<string>) => string
```

