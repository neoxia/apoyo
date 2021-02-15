export interface Tree<A> {
  readonly value: A
  readonly forest: Tree<A>[]
}

export const of = <A>(value: A, forest: Tree<A>[] = []): Tree<A> => ({
  value,
  forest
})

export const draw = (tree: Tree<string>): string => tree.value + drawForest('\n', tree.forest)

export const drawForest = (indentation: string, forest: Tree<string>[]): string => {
  let r = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += drawForest(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

export const Tree = {
  of,
  draw
}
