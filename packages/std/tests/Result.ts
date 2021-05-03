import { Arr, Err, pipe, Result, throwError } from '../src'

describe('Result.ok', () => {
  it('should create ok', () => {
    const v = Result.ok(1)
    expect(v).toEqual({
      _tag: 'Result.Ok',
      ok: 1
    })
    expect(v).toEqual(Result.ok(1))
  })
})

describe('Result.ko', () => {
  it('should create ko', () => {
    const v = Result.ko(1)
    expect(v).toEqual({
      _tag: 'Result.Ko',
      ko: 1
    })
    expect(v).toEqual(Result.ko(1))
  })
})

describe('Result.fromOption', () => {
  it('should create ok from some value', () => {
    const v = pipe(
      0,
      Result.fromOption(() => 1)
    )
    expect(v).toEqual(Result.ok(0))
  })
  it('should create ko from undefined', () => {
    const v = pipe(
      undefined,
      Result.fromOption(() => 1)
    )
    expect(v).toEqual(Result.ko(1))
  })
})

describe('Result.isOk', () => {
  it('should return true', () => {
    expect(pipe(Result.ok(1), Result.isOk)).toBe(true)
  })

  it('should return false for ko', () => {
    expect(pipe(Result.ko(1), Result.isOk)).toBe(false)
  })
})

describe('Result.isKo', () => {
  it('should return true', () => {
    expect(pipe(Result.ko(1), Result.isKo)).toBe(true)
  })

  it('should return false for ok', () => {
    expect(pipe(Result.ok(1), Result.isKo)).toBe(false)
  })
})

describe('Result.isResult', () => {
  it('should return true', () => {
    expect(pipe(Result.ko(1), Result.isResult)).toBe(true)
    expect(pipe(Result.ok(1), Result.isResult)).toBe(true)
  })

  it('should return false for unknown object', () => {
    expect(pipe({ name: 'John Doe' }, Result.isResult)).toBe(false)
  })
})

describe('Result.get', () => {
  it('should return expected results', () => {
    expect(pipe(Result.ok(1), Result.get)).toBe(1)
  })

  it('should throw on Ko', () => {
    expect(() => pipe(Result.ko('on ko'), Result.get)).toThrow('on ko')
  })
})

describe('Result.map', () => {
  it('should execute on ok', () => {
    const res = pipe(
      Result.ok(1),
      Result.map((a) => a + 1)
    )
    expect(res).toEqual(Result.ok(2))
  })

  it('should not execute on ko', () => {
    const res = pipe(
      Result.ko(1),
      Result.map((a: any) => a + 1)
    )
    expect(res).toEqual(Result.ko(1))
  })
})

describe('Result.mapError', () => {
  it('should execute on ko', () => {
    const res = pipe(
      Result.ko(1),
      Result.mapError((a) => a + 1)
    )
    expect(res).toEqual(Result.ko(2))
  })

  it('should not execute on ok', () => {
    const res = pipe(
      Result.ok(1),
      Result.mapError((a: number) => a + 1)
    )
    expect(res).toEqual(Result.ok(1))
  })
})

describe('Result.chain', () => {
  it('should execute on ok', () => {
    const res = pipe(
      Result.ok(1),
      Result.chain((a) => Result.ok(a + 1))
    )
    expect(res).toEqual(Result.ok(2))
  })

  it('can chain error', () => {
    const res = pipe(
      Result.ok(1),
      Result.chain((a) => Result.ko(a + 1))
    )
    expect(res).toEqual(Result.ko(2))
  })

  it('should not execute on ko', () => {
    const res = pipe(
      Result.ko(1),
      Result.chain((a: number) => Result.ok(a + 1))
    )
    expect(res).toEqual(Result.ko(1))
  })
})

describe('Result.catchError', () => {
  it('should execute on ko', () => {
    const res = pipe(
      Result.ko(1),
      Result.catchError((a) => Result.ko(a + 1))
    )
    expect(res).toEqual(Result.ko(2))
  })

  it('can chain ok', () => {
    const res = pipe(
      Result.ko(1),
      Result.catchError((a: number) => Result.ok(a + 1))
    )
    expect(res).toEqual(Result.ok(2))
  })

  it('should not execute on ok', () => {
    const res = pipe(
      Result.ok(1),
      Result.catchError((a: any) => Result.ko(a + 1))
    )
    expect(res).toEqual(Result.ok(1))
  })
})

describe('Result.swap', () => {
  it('should swap ok to ko', () => {
    const v = pipe(Result.ok(1), Result.swap)
    expect(v).toEqual(Result.ko(1))
  })
  it('should swap ko to ok', () => {
    const v = pipe(Result.ko(1), Result.swap)
    expect(v).toEqual(Result.ok(1))
  })
})

describe('Result.fold', () => {
  it('should exec ok callback', () => {
    const v = pipe(
      Result.ok(1),
      Result.fold(
        (value) => value + 1,
        () => 0
      )
    )
    expect(v).toEqual(2)
  })
  it('should exec ko callback', () => {
    const v = pipe(
      Result.ko(1),
      Result.fold(
        (value: number) => value + 1,
        () => 0
      )
    )
    expect(v).toEqual(0)
  })
})

describe('Result.tryCatch', () => {
  it('should set result to ok', () => {
    const v = pipe(() => {
      return 1
    }, Result.tryCatch)
    expect(v).toEqual(Result.ok(1))
  })
  it('should catch error to ko', () => {
    const v = pipe(() => {
      throw 1
    }, Result.tryCatch)
    expect(v).toEqual(Result.ko(1))
  })
})

describe('Result.tryCatchFn', () => {
  const divide = (a: number, b: number) => (b === 0 ? throwError(Err.of('cannot divide by zero')) : a / b)
  const divideBy = (b: number) => (a: number) => divide(a, b)

  it('should work in pipe', () => {
    const [, ko] = pipe([1, 2, 3], Arr.map(Result.tryCatchFn(divideBy(0))), Arr.separate)
    expect(ko.length).toEqual(3)
  })
  it('should work with multiple arguments', () => {
    const safeDivide = Result.tryCatchFn(divide)
    const a = safeDivide(3, 0)
    const b = safeDivide(3, 1)

    expect(Result.isKo(a)).toEqual(true)
    expect(Result.isOk(b)).toEqual(true)
  })
})
