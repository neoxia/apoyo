import { Err, pipe, Result } from '@apoyo/std'

export const end = () =>
  new Promise<Result<number, Error>>(async (resolve) => {
    const removeListeners = () => {
      process.off('beforeExit', handleBeforeExit)
      process.off('uncaughtException', handleException)
      process.off('unhandledRejection', handleException)
      process.off('SIGTERM', handleSigs)
      process.off('SIGINT', handleSigs)
      process.off('SIGUSR1', handleSigs)
      process.off('SIGUSR2', handleSigs)
    }

    const handleBeforeExit = (code: number) => {
      removeListeners()
      resolve(
        code === 0
          ? Result.ok(0)
          : Result.ko(
              Err.of('Exit program with code {code}', {
                code
              })
            )
      )
    }

    const handleSigs = () => {
      removeListeners()
      resolve(Result.ok(0))
    }

    const handleException = (reason: any) => {
      removeListeners()
      resolve(Result.ko(pipe(reason, Err.chain(`Exit program with code {code}`, { code: 1 }))))
    }

    // On empty event loop or process.emit 'exit' signal
    process.on('beforeExit', handleBeforeExit)

    // On uncaught error
    process.on('uncaughtException', handleException)
    process.on('unhandledRejection', handleException)

    // On termination signals
    process.on('SIGTERM', handleSigs)
    process.on('SIGINT', handleSigs)

    // Handle nodemon restart
    process.on('SIGUSR1', handleSigs)
    process.on('SIGUSR2', handleSigs)
  })
