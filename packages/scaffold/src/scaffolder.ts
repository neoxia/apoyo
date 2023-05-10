import { IFileSystem } from './fs'
import { IScaffolderAction } from './scaffolder-action'
import { ITemplateEngine } from './template-engine'
import { Event, IEventListener } from './events'

import * as changeCase from 'change-case'
import * as inflection from 'inflection'

export interface ScaffolderOptions {
  templates: IFileSystem
  destination: IFileSystem
  renderer: ITemplateEngine
  parameters?: Record<string, unknown>
  listeners?: IEventListener[]
}

export class Scaffolder {
  private _listeners: IEventListener[]

  constructor(private readonly options: ScaffolderOptions) {
    this._listeners = options.listeners ?? []
  }

  public get templates() {
    return this.options.templates
  }

  public get destination() {
    return this.options.destination
  }

  public get renderer() {
    return this.options.renderer
  }

  public getHelpers() {
    return {
      changeCase,
      inflection
    }
  }

  public getParameters() {
    return this.options.parameters ?? {}
  }

  public child(options: Partial<ScaffolderOptions>) {
    return new Scaffolder({
      templates: options.templates ?? this.templates,
      destination: options.destination ?? this.destination,
      renderer: options.renderer ?? this.renderer,
      parameters: {
        ...this.options.parameters,
        ...options.parameters
      }
    })
  }

  public async execute(actions: IScaffolderAction[]): Promise<void> {
    for (const action of actions) {
      await action.execute(this)
    }
  }

  public async render(content: string, parameters?: Record<string, unknown>): Promise<string> {
    return this.renderer.render(content, {
      h: this.getHelpers(),
      ...this.getParameters(),
      ...parameters
    })
  }

  public async dispatch(event: Event) {
    for (const listener of this._listeners) {
      await listener.on(event)
    }
  }
}
