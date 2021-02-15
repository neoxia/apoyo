// import _ from 'underscore'
import { Arr, Decode, Err, identity, IO, Ord, pipe, Prom, Task } from '../src'
import { fromDate } from '../src/Option'

IO.run(() => {
  // Underscore
  // No chaining
  // const nbs = [1, 1, 2, 1, 4, 3, 4]
  // const nbsFiltered = _.filter(
  //   _.map(_.uniq(nbs), (a) => a + 1),
  //   (a) => a > 2
  // )
  // return nbsFiltered
})

IO.run(() => {
  // Underscore
  // With variables
  // const nbs = [1, 1, 2, 1, 4, 3, 4]
  // const nbsUniq = _.uniq(nbs)
  // const nbsIncremented = _.map(nbsUniq, (a) => a + 1)
  // const nbsFiltered = _.filter(nbsIncremented, (a) => a > 2)
  // return nbsFiltered
})

IO.run(() => {
  // With pipe

  const nbs = [1, 1, 2, 1, 4, 3, 4]
  const nbsFiltered = pipe(
    nbs,
    Arr.uniq(identity),
    Arr.map((a) => a + 1),
    Arr.filter((a) => a > 2)
  )

  return nbsFiltered
})

interface Pool {}
interface Connection {}
type Queryable = Pool | Connection
interface Contact {}

declare const pool: Pool
declare const contacts: Contact[]
declare function transaction<T>(pool: Pool, fn: (conn: Connection) => Promise<T>): Promise<T>
declare function updateContact(conn: Queryable, contact: Contact): Promise<void>

IO.run(async () => {
  // Execute multiple aynchroneous actions without stopping on error

  const results = await pipe(
    contacts,
    Arr.map(
      (contact): Task<void> => () =>
        transaction(pool, async (conn) => {
          await updateContact(conn, contact)
        })
    ),
    Arr.map(Task.tryCatch),
    Task.concurrent(4),
    Task.run
  )
  const [ok, errors] = Arr.separate(results)

  console.log('Results', { ok, errors })
})

IO.run(async () => {
  // Execute multiple aynchroneous actions without stopping on error

  const results = await pipe(
    contacts,
    Arr.map((contact) => () => updateContact(pool, contact)),
    Arr.map(Task.tryCatch),
    Task.concurrent(4),
    Task.run
  )
  const [ok, errors] = Arr.separate(results)

  console.log('Results', { ok, errors })
})

IO.run(() => {
  //

  const len = (s: string): number => s.length
  const double = (n: number): number => n * 2

  // without pipe
  double(len('aaa')) // returns 6

  // with pipe
  pipe('aaa', len, double) // returns 6
})

interface User {
  id: string
}
declare function findUsers(): Promise<User[]>

IO.run(async () => {
  // without pipe / helpers

  await Prom.tryCatch(
    findUsers()
      .catch((err) => Promise.reject(new Error(`findUserById failed: ${err.message}`)))
      .then((arr) => arr.map((user) => user.id).slice(0, 10))
  )

  // with pipe and helpers

  await pipe(
    findUsers(),
    Prom.mapError(Err.chain(`findUsers failed`)),
    Prom.map(Arr.map((user) => user.id)),
    Prom.map(Arr.take(10)),
    Prom.tryCatch
  )
})

interface Job {
  priority?: number
  createdAt: string
}

IO.run(() => {
  const ordByPriority = pipe(
    Ord.number,
    Ord.option,
    Ord.contramap((job: Job) => job.priority)
  )
  const ordByCreatedAtDesc = pipe(
    Ord.date,
    Ord.inverse,
    Ord.option,
    Ord.contramap((job: Job) => fromDate(new Date(job.createdAt)))
  )

  const ordJob = Ord.concat(ordByPriority, ordByCreatedAtDesc)
})

IO.run(async () => {
  // Decoder

  const TodoDecoder = Decode.struct({
    id: Decode.uuid,
    title: Decode.string,
    text: Decode.string,
    done: Decode.boolean,
    createdAt: Decode.datetime,
    finishedAt: Decode.datetime
  })

  interface Todo extends Decode.TypeOf<typeof TodoDecoder> {}
})

IO.run(async () => {
  const square = (nb: number) => nb * nb

  const mapPromise = <A, B>(fn: (value: A) => B) => (promi: Promise<A>): Promise<B> => promi.then(fn)

  pipe(Prom.of(42), mapPromise(square), mapPromise(square))
})
