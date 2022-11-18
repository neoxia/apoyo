import { BasePolicy } from '../../../../src'
import { Acl, CommonPolicyContext } from '../../context'
import { Post } from '../../types'
import { CommonPolicy } from '../common.policy'
import { PostPolicy } from './base.policy'

export class EditPostPolicy implements BasePolicy {
  public async *authorize(ctx: CommonPolicyContext, post: Post) {
    yield* PostPolicy.before(ctx, post)
    yield* CommonPolicy.requireAcl(ctx, Acl.WRITE_POSTS)

    const user = ctx.getCurrentUser()
    return user?.id === post.authorId
  }
}
