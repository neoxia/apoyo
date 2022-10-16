import { Policy } from '../../../src'
import { AppPolicyContext } from '../context'
import { Post } from '../types'

export namespace PostPolicy {
  export const editPost = Policy.create((ctx: AppPolicyContext, post: Post) => {
    return ctx.getCurrentUser().id === post.userId
  })
}
