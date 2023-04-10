import { render as renderEjs, renderFile as renderFileEjs } from 'ejs'

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

  public async renderFile(path: string, parameters: Record<string, unknown>): Promise<string> {
    return renderFileEjs(`${path}${this.extension}`, parameters, {
      root: this.config.rootDir,
      async: true
    })
  }
}
