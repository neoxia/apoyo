import { Arr, pipe, Option } from '@apoyo/std'
import { Scope } from '../Scope'
import { getInternalScope } from '../utils'

export const getRootScope = (scope: Scope) => getInternalScope(scope).root

export const getLowestScope = (scope: Scope, scopes: Scope[]) => {
  const internal = getInternalScope(scope)
  return pipe(scopes, Arr.min(internal.ord), Option.get(internal.root))
}
