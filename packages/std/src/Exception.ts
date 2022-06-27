/**
 * Base exception class that can be extended to create custom exceptions:
 *
 * @example
 * ```ts
 * class AccessException extends Exception {}
 * ```
 */
export class Exception extends Error {
  [key: string]: unknown

  constructor(message?: string, cause?: Error) {
    // 'Error' breaks prototype chain here
    super(message)

    // Restore prototype chain
    const proto = new.target.prototype
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, proto)
    } else {
      this.__proto__ = proto
    }

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true
    })

    Object.defineProperty(this, 'cause', {
      configurable: true,
      enumerable: false,
      value: cause,
      writable: true
    })
  }
}
