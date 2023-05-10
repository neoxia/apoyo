export class Event {}

export class FileEvent extends Event {
  constructor(public readonly filename: string) {
    super()
  }
}

export class FileCreatedEvent extends FileEvent {}
export class FileModifiedEvent extends FileEvent {}
export class FileDeletedEvent extends FileEvent {}
export class FileSkippedEvent extends FileEvent {}

export type Type<T> = { new (...args: any[]): T }

export interface IEventListener {
  on(event: Event): Promise<void>
}
