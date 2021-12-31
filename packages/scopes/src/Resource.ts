export type Resource<T = any> = {
  value: T
  unmount?: Resource.Unmount
}
export namespace Resource {
  export type Unmount = () => void | Promise<void>
}

export const of = <T>(value: T, unmount?: Resource.Unmount): Resource<T> => ({
  value,
  unmount
})

export const Resource = {
  of
}
