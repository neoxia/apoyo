import { render as renderEjs, renderFile as renderFileEjs } from 'ejs'
import path from 'path'

export interface ITemplateEngine {
  readonly extension: string
  render(content: string, parameters: Record<string, unknown>): Promise<string>
  renderFile(path: string, parameters: Record<string, unknown>): Promise<string>
}

export class EjsTemplateEngine implements ITemplateEngine {
  public readonly extension = '.ejs'

  constructor(private readonly config: { rootDir: string }) {}

  public async render(content: string, parameters: Record<string, unknown>): Promise<string> {
    return renderEjs(content, parameters, {
      async: true
    })
  }

  public async renderFile(template: string, parameters: Record<string, unknown>): Promise<string> {
    const p = path.resolve(this.config.rootDir, `${template}${this.extension}`)
    return renderFileEjs(p, parameters, {
      async: true
    })
  }
}
