export namespace Resource {
  export type Unmount = () => void | Promise<void>
}

export class Resource<T> {
  private constructor(public readonly value: T, public readonly unmount?: Resource.Unmount) {}

  public static of<T>(value: T, unmount?: Resource.Unmount): Resource<T> {
    return new Resource(value, unmount)
  }
}
