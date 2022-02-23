export class Stack<T> {
  private _stack: T[] = []

  public push(value: T): void {
    this._stack.push(value)
  }

  public pop(): T | undefined {
    return this._stack.pop()
  }

  public peek(): T | undefined {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : undefined
  }
}
