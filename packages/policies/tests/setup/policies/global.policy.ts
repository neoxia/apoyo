import { Policy } from '../../../src'
import { AppPolicyContext } from '../context'

export namespace GlobalPolicy {
  export const isAdmin = Policy.create((ctx: AppPolicyContext) => {
    if (ctx.getCurrentUser().role === 'admin') {
      return true
    }
  })
}
