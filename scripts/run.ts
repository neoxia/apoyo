export function run(fn: () => Promise<any>) {
  fn().then(
    () => {
      process.exitCode = 0
    },
    (e) => {
      console.error(e) // tslint:disable-line no-console
      process.exitCode = 1
    }
  )
}
