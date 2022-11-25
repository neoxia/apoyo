export class ProviderKey {
  public readonly symbol: Symbol

  public constructor(name?: string) {
    this.symbol = Symbol(name)
  }

  public static create(name?: string) {
    return new ProviderKey(name)
  }
}
