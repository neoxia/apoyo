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

  constructor(message?: string, public readonly cause?: Error) {
    // 'Error' breaks prototype chain here
    super(message)

    // restore prototype chain
    const actualProto = new.target.prototype

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto)
    } else {
      this.__proto__ = actualProto
    }
  }
}
