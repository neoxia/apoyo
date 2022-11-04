import { pipe } from '@apoyo/std'
import { Policy } from '../../../src'
import { CommonPolicyContext } from '../context'

function isAdmin(ctx: CommonPolicyContext) {
  if (ctx.getCurrentUser().role === 'admin') {
    return true
  }
}

export namespace CommonPolicy {
  export const base = pipe(Policy.base(), Policy.use(isAdmin))
}
