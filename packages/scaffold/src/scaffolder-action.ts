export interface IScaffolderAction {
  execute(app: Scafolder): Promise<void>
}
