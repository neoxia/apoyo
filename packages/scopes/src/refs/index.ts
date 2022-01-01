export const REF_SYMBOL: unique symbol = Symbol('Ref')

export type Ref = {
  [REF_SYMBOL]: boolean
}

export const create = (): Ref => ({
  [REF_SYMBOL]: true
})

export const Ref = {
  create
}
