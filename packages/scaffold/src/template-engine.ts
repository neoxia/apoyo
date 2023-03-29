import { render as renderEjs } from 'ejs'

export interface ITemplateEngine {
  readonly extension: string
  render(content: string, parameters: Record<string, unknown>): Promise<string>
}

export class EjsTemplateEngine implements ITemplateEngine {
  public readonly extension: string = '.ejs'

  public async render(content: string, parameters: Record<string, unknown>): Promise<string> {
    return renderEjs(content, parameters, {
      async: true
    })
  }
}
