import { Acl, CommonPolicyContext } from '../../context'
import { Post } from '../../types'
import { CommonPolicy } from '../common.policy'

export namespace PostPolicy {
  export async function* isModerator(ctx: CommonPolicyContext, _post: Post) {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (user && user.role === 'moderator') {
      const hasAcl = await this.hasAccess(user, Acl.MODERATE_POSTS)
      if (hasAcl) {
        yield true
      }
    }
  }

  export async function* before(ctx: CommonPolicyContext, post: Post) {
    yield* CommonPolicy.before(ctx)
    yield* PostPolicy.isModerator(ctx, post)
  }
}
