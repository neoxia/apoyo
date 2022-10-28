import { pipe } from '@apoyo/std'
import { Policy } from '../../../src'
import { CommonPolicyContext } from '../context'

const isAdmin = (ctx: CommonPolicyContext) => {
  if (ctx.getCurrentUser().role === 'admin') {
    return true
  }
}

export const CommonPolicyBuilder = pipe(Policy.base(), Policy.before(isAdmin))
