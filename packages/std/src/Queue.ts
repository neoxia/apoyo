/**
 * @namespace Queue
 *
 * @description
 * Simple FIFO queue implementation.
 *
 */
export class Queue<T> {
  private _queue: Record<number, T> = {}
  private _enqueueIndex = 0
  private _dequeueIndex = 0

  /**
   * @description
   * Create a new empty Queue
   */
  public static of<T>() {
    return new Queue<T>()
  }

  /**
   * @description
   * Create a new Queue from an Array
   */
  public static fromArray<T>(arr: T[]) {
    const q = new Queue<T>()
    for (const item of arr) {
      q.enqueue(item)
    }
    return q
  }

  /**
   * @description
   * Add a value to the queue
   */
  public enqueue(value: T): void {
    this._queue[this._enqueueIndex] = value
    this._enqueueIndex = (this._enqueueIndex + 1) % Number.MAX_SAFE_INTEGER
  }

  /**
   * @description
   * Get and remove next value from the queue
   */
  public dequeue(): T | undefined {
    if (this._dequeueIndex >= this._enqueueIndex) {
      return undefined
    }
    const value = this._queue[this._dequeueIndex]
    this._dequeueIndex = (this._dequeueIndex + 1) % Number.MAX_SAFE_INTEGER
    return value
  }

  /**
   * @description
   * Get next value from the queue without removing it
   */
  public peek(): T | undefined {
    if (this._dequeueIndex >= this._enqueueIndex) {
      return undefined
    }
    return this._queue[this._dequeueIndex]
  }

  public size() {
    return this._enqueueIndex - this._dequeueIndex
  }
}
