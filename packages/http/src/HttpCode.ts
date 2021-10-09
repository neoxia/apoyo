/**
 * @description
 * Please look up https://developer.mozilla.org/en-US/docs/Web/HTTP/Status to learn more about what each status code means.
 */
export enum HttpCode {
  /** Successes */
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  /** Redirections */
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  /** Client errors */
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  UNPROCESSABLE_ENTITY = 422,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,

  /** Server errors */
  INTERNAL_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}
