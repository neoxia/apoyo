export function run(fn: () => Promise<any>) {
  fn().then(
    () => {
      process.exitCode = 0
    },
    (e) => {
      // eslint-disable-next-line no-console
      console.error(e)
      process.exitCode = 1
    }
  )
}
