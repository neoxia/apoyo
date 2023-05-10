import chalk from 'chalk'
import path from 'path'
import {
  Event,
  FileEvent,
  IEventListener,
  FileCreatedEvent,
  FileModifiedEvent,
  FileDeletedEvent,
  FileSkippedEvent
} from './events'

export interface ILogger {
  info(message: string): void
}

export interface FileEventsLoggerOptions {
  enabled?: boolean
  cwd?: string
  logger?: ILogger
}

export class FileEventsLogger implements IEventListener {
  private readonly _options: Required<FileEventsLoggerOptions>
  private readonly _mappings = new Map([
    [
      FileCreatedEvent.name,
      (event: FileEvent) => {
        this._log(chalk.green(this._format('created', event.filename)))
      }
    ],
    [
      FileModifiedEvent.name,
      (event: FileEvent) => {
        this._log(chalk.magenta(this._format('modified', event.filename)))
      }
    ],
    [
      FileDeletedEvent.name,
      (event: FileEvent) => {
        this._log(chalk.red(this._format('deleted', event.filename)))
      }
    ],
    [
      FileSkippedEvent.name,
      (event: FileEvent) => {
        this._log(chalk.yellow(this._format('skipped', event.filename)))
      }
    ]
  ])

  constructor(options: FileEventsLoggerOptions = {}) {
    this._options = {
      enabled: options.enabled ?? true,
      cwd: options.cwd ?? process.cwd(),
      logger: options.logger ?? console
    }
  }

  public async on(event: Event): Promise<void> {
    if (this._options.enabled === false) {
      return
    }
    if (event instanceof FileEvent) {
      const eventName = event.constructor?.name
      const mapping = this._mappings.get(eventName)
      mapping?.(event)
    }
  }

  private _log(msg: string) {
    this._options.logger.info(msg)
  }

  private _format(type: string, filename: string) {
    return type.toUpperCase().padEnd(10) + ' ' + path.relative(this._options.cwd, filename).replace(/\\/g, '/')
  }
}
