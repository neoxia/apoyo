import { Scope } from './Scope'
import { Var } from './Var'

export const CurrentScope = Var.abstract<Scope>('CurrentScope')
