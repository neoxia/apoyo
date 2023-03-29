import { render as renderEjs } from 'ejs'

export interface ITemplateEngine {
  render(content: string, parameters: Record<string, unknown>): Promise<string>
}

export class EjsTemplateEngine implements ITemplateEngine {
  public async render(content: string, parameters: Record<string, unknown>): Promise<string> {
    return renderEjs(content, parameters, {
      async: true
    })
  }
}
