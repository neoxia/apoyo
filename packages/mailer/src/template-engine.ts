import { render as renderEjs, renderFile as renderFileEjs } from 'ejs'

export interface ITemplateEngine {
  render(content: string, parameters: Record<string, unknown>): Promise<string>
  renderFile(path: string, parameters: Record<string, unknown>): Promise<string>
}

export class EjsTemplateEngine implements ITemplateEngine {
  constructor(private readonly config: { rootDir: string }) {}

  public async render(content: string, parameters: Record<string, unknown>): Promise<string> {
    return renderEjs(content, parameters, {
      async: true
    })
  }

  public async renderFile(path: string, parameters: Record<string, unknown>): Promise<string> {
    return renderFileEjs(path, parameters, {
      root: this.config.rootDir,
      async: true
    })
  }
}
