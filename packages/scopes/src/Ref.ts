export type Ref = {
  name: string
}

export const create = (name: string): Ref => ({
  name
})

export const Ref = {
  create
}
