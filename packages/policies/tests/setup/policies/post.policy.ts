import { pipe } from '@apoyo/std'
import { Policy } from '../../../src'
import { PostPolicyContext } from '../context'
import { Post } from '../types'
import { CommonPolicyBuilder } from './common.policy'

const isModerator = async (ctx: PostPolicyContext, _post: Post) => {
  if (await ctx.isPostModerator()) {
    return true
  }
}

const viewPost = async (ctx: PostPolicyContext, post: Post) => {
  const user = ctx.getCurrentUser({ allowGuest: true })

  if (post.status === 'draft') {
    return user?.id === post.userId
  }
  return true
}

const editPost = async (ctx: PostPolicyContext, post: Post) => {
  const user = ctx.getCurrentUser()
  return user?.id === post.userId
}

const PostPolicyBuilder = pipe(CommonPolicyBuilder, Policy.namespace('PostPolicy'), Policy.before(isModerator))

export const PostPolicy = {
  viewPost: pipe(PostPolicyBuilder, Policy.define('viewPost', viewPost)),
  editPost: pipe(PostPolicyBuilder, Policy.define('editPost', editPost))
}
