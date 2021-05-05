import { pipe } from '../src/'

describe('pipe', () => {
  it('should return initial', () => {
    expect(pipe(1)).toBe(1)
  })

  it('should pipe', () => {
    expect(pipe(1, (a) => a + 1)).toBe(2)

    expect(
      pipe(
        1,
        (a) => a + 1,
        (a) => a * 2
      )
    ).toBe(4)
  })
})
