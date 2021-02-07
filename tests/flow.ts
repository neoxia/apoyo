import { flow } from '../src/'

describe('flow', () => {
  const len = (s: string): number => s.length
  const double = (n: number): number => n * 2
  
  const f = flow(len, double)

  it('should return a function', () => {
    expect(typeof f).toBe('function')
  })

  it('should return the expected result once called', () => {
    expect(f("hello")).toBe(8)
  })
})
