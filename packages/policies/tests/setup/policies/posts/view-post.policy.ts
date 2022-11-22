import { BasePolicy } from '../../../../src'
import { CommonPolicyContext } from '../../context'
import { Post } from '../../types'
import { PostPolicy } from './base.policy'

export class ViewPostPolicy implements BasePolicy {
  public async *authorize(ctx: CommonPolicyContext, post: Post) {
    yield* PostPolicy.before(ctx, post)

    if (post.status === 'published') {
      return true
    }

    const user = ctx.getCurrentUser()
    return user.id === post.authorId
  }
}
