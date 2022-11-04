import { pipe } from '@apoyo/std'
import { Policy } from '../../../src'
import { PostPolicyContext } from '../context'
import { Post } from '../types'
import { CommonPolicy } from './common.policy'

export namespace PostPolicy {
  async function isModerator(ctx: PostPolicyContext, _post: Post) {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (await ctx.isPostModerator(user)) {
      return true
    }
  }

  const base = pipe(CommonPolicy.base, Policy.namespace('PostPolicy'), Policy.use(isModerator))

  export const viewPost = pipe(
    base,
    Policy.define('viewPost', async (ctx: PostPolicyContext, post: Post) => {
      const user = ctx.getCurrentUser({ allowGuest: true })
      if (post.status === 'draft') {
        return user?.id === post.userId
      }
      return true
    })
  )

  export const editPost = pipe(
    base,
    Policy.define('editPost', async (ctx: PostPolicyContext, post: Post) => {
      const user = ctx.getCurrentUser()
      return user?.id === post.userId
    })
  )
}
