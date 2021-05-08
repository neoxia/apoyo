// import { pipe, Prom, Result, Task, TaskResult } from '@apoyo/std'
// import { Decode, DecodeError, TaskDecode } from '../src'

// describe('TaskDecode.map', () => {
//   const flooredNumber = pipe(
//     Decode.number,
//     TaskDecode.map((x) => Math.floor(x))
//   )

//   it('should succeed', async () => {
//     const res = await pipe(flooredNumber(42.2531726), TaskResult.get)
//     expect(res).toBe(42)
//   })
// })

// describe('TaskDecode.chain', () => {
//   const stringToNumber = pipe(
//     Decode.string,
//     TaskDecode.chain((x) => async () => {
//       await Prom.sleep(10)
//       const nb = parseFloat(x)
//       return Number.isNaN(nb) ? Result.ko(DecodeError.value(x, `Could not parse string to number`)) : Result.ok(nb)
//     })
//   )

//   it('should succeed', async () => {
//     const res = await pipe(stringToNumber('42'), TaskResult.get)
//     expect(res).toBe(42)
//   })
// })

// describe('TaskDecode.chainAsync', () => {
//   const stringToNumber = pipe(
//     Decode.string,
//     TaskDecode.chainAsync(async (x) => {
//       await Prom.sleep(10)
//       const nb = parseFloat(x)
//       return Number.isNaN(nb) ? Result.ko(DecodeError.value(x, `Could not parse string to number`)) : Result.ok(nb)
//     })
//   )

//   it('should succeed', async () => {
//     const res = await pipe(stringToNumber('42'), TaskResult.get)
//     expect(res).toBe(42)
//   })
// })

// describe('TaskDecode.array', () => {
//   const decodeStringArray = TaskDecode.array(Decode.string)

//   it('should succeed', async () => {
//     const res = await pipe(decodeStringArray(['Hello', 'World']), Task.map(Result.isOk), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with string', async () => {
//     const res = await pipe(decodeStringArray('Hello'), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with array of bad type', async () => {
//     const res = await pipe(decodeStringArray([42]), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should work with custom async strategy', async () => {
//     const results: number[] = []

//     const decodeCustom = pipe(
//       Decode.number,
//       TaskDecode.chainAsync(async (ms) => {
//         await Prom.sleep(ms)
//         results.push(ms)
//         return Result.ok(ms)
//       })
//     )
//     const decodeDict = TaskDecode.array(decodeCustom, undefined, Task.concurrent(4))
//     const items = [100, 100, 20, 20, 5, 5]

//     const ok = await pipe(items, decodeDict, Task.run)
//     expect(pipe(ok, Result.isOk)).toBe(true)
//     expect(pipe(ok, Result.get)).toEqual(items)
//     expect(results).toEqual([20, 20, 5, 5, 100, 100])
//   })
// })

// describe('TaskDecode.dict', () => {
//   const decodeStringDict = TaskDecode.dict(Decode.string)

//   it('should succeed', async () => {
//     const res = await pipe(
//       {
//         foo: 'bar',
//         hello: 'world'
//       },
//       decodeStringDict,
//       Task.map(Result.isOk),
//       Task.run
//     )
//     expect(res).toBe(true)
//   })

//   it('should fail with string', async () => {
//     const res = await pipe(decodeStringDict('Hello'), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with dict of bad type', async () => {
//     const res = await pipe(decodeStringDict({ foo: 42 }), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should work with custom async strategy', async () => {
//     const results: number[] = []

//     const decodeCustom = pipe(
//       Decode.number,
//       TaskDecode.chainAsync(async (ms) => {
//         await Prom.sleep(ms)
//         results.push(ms)
//         return Result.ok(ms)
//       })
//     )
//     const decodeDict = TaskDecode.dict(decodeCustom, undefined, Task.concurrent(4))

//     const items = {
//       0: 100,
//       1: 100,
//       2: 20,
//       3: 20,
//       4: 5,
//       5: 5
//     }

//     const ok = await pipe(items, decodeDict, Task.run)
//     expect(pipe(ok, Result.isOk)).toBe(true)
//     expect(pipe(ok, Result.get)).toEqual(items)
//     expect(results).toEqual([20, 20, 5, 5, 100, 100])
//   })
// })

// describe('TaskDecode.struct', () => {
//   const decodeTodo = TaskDecode.struct({
//     id: Decode.number,
//     title: Decode.string,
//     done: Decode.boolean,
//     description: pipe(Decode.string, Decode.option)
//   })

//   interface Todo extends TaskDecode.TypeOf<typeof decodeTodo> {}

//   it('should succeed', async () => {
//     const todos: Todo[] = [
//       {
//         id: 2,
//         title: 'Eat breakfast',
//         done: false,
//         description: 'A delicious bread with Nutella'
//       },
//       {
//         id: 1,
//         title: 'Wake up',
//         done: true
//       }
//     ]

//     expect(await pipe(todos[0], decodeTodo, Task.map(Result.isOk), Task.run)).toBe(true)
//     expect(await pipe(todos[1], decodeTodo, Task.map(Result.isOk), Task.run)).toBe(true)
//   })

//   it('should strip additional fields', async () => {
//     const base = {
//       id: 2,
//       title: 'Eat breakfast',
//       done: false,
//       description: 'A delicious bread with Nutella'
//     }
//     const todo = {
//       ...base,
//       created_at: new Date()
//     }

//     expect(await pipe(todo, decodeTodo, Task.map(Result.get), Task.run)).toEqual(base)
//   })

//   it('should fail with string', async () => {
//     const res = await pipe(decodeTodo('Hello'), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with empty struct', async () => {
//     const res = await pipe(decodeTodo({}), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with missing field', async () => {
//     // @ts-expect-error Todo is missing fields
//     const todo: Todo = {
//       title: 'Wake up',
//       done: true
//     }
//     expect(await pipe(decodeTodo(todo), Task.map(Result.isKo), Task.run)).toBe(true)
//   })

//   it('should fail with invalid field', async () => {
//     const todo: Todo = {
//       // @ts-expect-error Todo.id is not a number
//       id: 'not a number',
//       title: 'Wake up',
//       done: true
//     }
//     expect(await pipe(decodeTodo(todo), Task.map(Result.isKo), Task.run)).toBe(true)
//   })

//   it('should work with custom async strategy', async () => {
//     const results: number[] = []

//     const decodeCustom = pipe(
//       Decode.number,
//       TaskDecode.chainAsync(async (ms) => {
//         await Prom.sleep(ms)
//         results.push(ms)
//         return Result.ok(ms)
//       })
//     )

//     const decodeTodoConcurrent = TaskDecode.struct(
//       {
//         field1: decodeCustom,
//         field2: decodeCustom,
//         field3: decodeCustom,
//         field4: decodeCustom,
//         field5: decodeCustom,
//         field6: decodeCustom
//       },
//       undefined,
//       Task.concurrent(4)
//     )

//     const items = {
//       field1: 100,
//       field2: 100,
//       field3: 20,
//       field4: 20,
//       field5: 5,
//       field6: 5
//     }

//     const ok = await pipe(items, decodeTodoConcurrent, Task.run)
//     expect(pipe(ok, Result.isOk)).toBe(true)
//     expect(pipe(ok, Result.get)).toEqual(items)
//     expect(results).toEqual([20, 20, 5, 5, 100, 100])
//   })
// })

// describe('TaskDecode.type', () => {
//   const decodeTodo = TaskDecode.type({
//     id: Decode.number,
//     title: Decode.string,
//     done: Decode.boolean,
//     description: pipe(Decode.string, Decode.option)
//   })

//   interface Todo extends TaskDecode.TypeOf<typeof decodeTodo> {}

//   it('should succeed', async () => {
//     const todos: Todo[] = [
//       {
//         id: 2,
//         title: 'Eat breakfast',
//         done: false,
//         description: 'A delicious bread with Nutella'
//       },
//       {
//         id: 1,
//         title: 'Wake up',
//         done: true
//       }
//     ]

//     expect(await pipe(todos[0], TaskDecode.validate<Todo>(decodeTodo), Task.map(Result.isOk), Task.run)).toBe(true)
//     expect(await pipe(todos[1], TaskDecode.validate<Todo>(decodeTodo), Task.map(Result.isOk), Task.run)).toBe(true)
//   })

//   it('should not strip additional fields', async () => {
//     const base: Todo = {
//       id: 2,
//       title: 'Eat breakfast',
//       done: false,
//       description: 'A delicious bread with Nutella'
//     }
//     const todo: Todo = {
//       ...base,
//       // @ts-expect-error Todo doesn't have a created_at prop
//       created_at: new Date()
//     }

//     expect(await pipe(todo, decodeTodo, Task.map(Result.get), Task.run)).toEqual(todo)
//   })

//   it('should fail with string', async () => {
//     const res = await pipe(decodeTodo('Hello'), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with empty struct', async () => {
//     const res = await pipe(decodeTodo({}), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with missing field', async () => {
//     const todo = {
//       title: 'Wake up',
//       done: true
//     }
//     expect(await pipe(decodeTodo(todo), Task.map(Result.isKo), Task.run)).toBe(true)
//   })

//   it('should fail with invalid field', async () => {
//     const todo = {
//       id: 'not a number',
//       title: 'Wake up',
//       done: true
//     }
//     expect(await pipe(decodeTodo(todo), Task.map(Result.isKo), Task.run)).toBe(true)
//   })
// })

// describe('TaskDecode.union', () => {
//   const stringOrNumber = TaskDecode.union(Decode.string, Decode.number)

//   it('should succeed', async () => {
//     expect(await pipe(stringOrNumber('string'), Task.map(Result.isOk), Task.run)).toBe(true)
//     expect(await pipe(stringOrNumber(42), Task.map(Result.isOk), Task.run)).toBe(true)
//   })

//   it('should fail', async () => {
//     const res = await pipe(stringOrNumber(false), Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })
// })

// describe('TaskDecode.merge', () => {
//   const a = TaskDecode.struct({
//     foo: Decode.string
//   })
//   const b = Decode.struct({
//     bar: Decode.string
//   })
//   const merged = TaskDecode.merge(a, b)

//   it('should succeed', async () => {
//     expect(
//       await pipe(
//         {
//           foo: 'a',
//           bar: 'b'
//         },
//         merged,
//         Task.map(Result.isOk),
//         Task.run
//       )
//     ).toBe(true)
//   })

//   it('should fail with empty struct', async () => {
//     const res = await pipe({}, merged, Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   it('should fail with missing member', async () => {
//     const res = await pipe({ foo: 'a' }, merged, Task.map(Result.isKo), Task.run)
//     expect(res).toBe(true)
//   })

//   // TODO: test merge multiple "Decode.type"
// })

// describe('TaskDecode.lazy', () => {
//   interface Tree<T> {
//     value: T
//     forest: Tree<T>[]
//   }

//   // recursives types require manual typing
//   const decodeStrTree: TaskDecode<unknown, Tree<string>> = TaskDecode.struct({
//     value: Decode.string,
//     forest: TaskDecode.lazy(() => TaskDecode.array(decodeStrTree))
//   })

//   // recursives types require manual typing
//   const decodeStringTree: TaskDecode<unknown, Tree<string>> = TaskDecode.lazy(() =>
//     TaskDecode.struct({
//       value: Decode.string,
//       forest: TaskDecode.array(decodeStringTree)
//     })
//   )

//   const decodeGenericTree = <O>(decoder: TaskDecode.T<unknown, O>): TaskDecode<unknown, Tree<O>> =>
//     TaskDecode.lazy(() =>
//       TaskDecode.struct({
//         value: decoder,
//         forest: TaskDecode.array(decodeGenericTree(decoder))
//       })
//     )

//   const t: Tree<string> = {
//     value: 'test',
//     forest: [
//       { value: 'foo', forest: [] },
//       { value: 'bar', forest: [{ value: 'bar.foo', forest: [] }] }
//     ]
//   }

//   it('should work', async () => {
//     expect(await pipe(t, decodeStrTree, Task.map(Result.isOk), Task.run)).toBe(true)
//     expect(await pipe(t, decodeStringTree, Task.map(Result.isOk), Task.run)).toBe(true)
//   })

//   it('should work with generic types', async () => {
//     expect(await pipe(t, decodeGenericTree(Decode.string), Task.map(Result.isOk), Task.run)).toBe(true)
//   })
// })
