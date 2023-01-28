import { BasePolicy } from '../../../src'
import { Acl, CommonPolicyContext } from '../context'
import { Post } from '../types'
import { CommonPolicy } from './common.policy'

async function* isModerator(ctx: CommonPolicyContext, _post: Post) {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user && user.role === 'moderator') {
    const hasAcl = await this.hasAccess(user, Acl.MODERATE_POSTS)
    if (hasAcl) {
      yield true
    }
  }
}

async function* before(ctx: CommonPolicyContext, post: Post) {
  yield* CommonPolicy.before(ctx)
  yield* isModerator(ctx, post)
}

export class ViewPostPolicy implements BasePolicy {
  public async *authorize(ctx: CommonPolicyContext, post: Post) {
    yield* before(ctx, post)

    if (post.status === 'published') {
      return true
    }

    const user = ctx.getCurrentUser()
    return user.id === post.authorId
  }
}

export class CreatePostPolicy implements BasePolicy {
  public async *authorize(ctx: CommonPolicyContext, post: Post) {
    yield* before(ctx, post)
    yield* CommonPolicy.requireAcl(ctx, Acl.WRITE_POSTS)

    const user = ctx.getCurrentUser()
    return user?.id === post.authorId
  }
}

export class EditPostPolicy implements BasePolicy {
  public async *authorize(ctx: CommonPolicyContext, post: Post) {
    yield* before(ctx, post)
    yield* CommonPolicy.requireAcl(ctx, Acl.WRITE_POSTS)

    const user = ctx.getCurrentUser()
    return user?.id === post.authorId
  }
}
