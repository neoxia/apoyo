export default {
  prompt: async (ctx: any) => {

    const { prompter, args, h } = ctx

    const moduleName: string = args.module ?? (await prompter
      .prompt({
        type: 'input',
        name: 'module',
        message: "What's the name of your module?"
      })).module

    const modelName = args.model ?? (await prompter
      .prompt({
        type: 'input',
        name: 'model',
        message: "What's the name of your model?"
      })).model

    const subfolder = h.inflection.pluralize(modelName)

    return {
      module: moduleName,
      model: modelName,
      subfolder,
    }
  }
}