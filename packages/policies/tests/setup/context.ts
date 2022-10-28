import { PolicyContext, UserContext } from '../../src'
import { User } from './types'

export class CommonPolicyContext extends PolicyContext<User> {
  constructor(userContext: UserContext<User>) {
    super(userContext)
  }

  public hasRole(role: string) {
    return this.getCurrentUser().role === role
  }
}

export enum Acl {
  MODERATE_POSTS = 'moderate:posts'
}

export class AccessRepository {
  public async hasAccess(_userId: string, _acl: Acl): Promise<boolean> {
    return true
  }
}

export class PostPolicyContext extends CommonPolicyContext {
  constructor(userContext: UserContext<User>, private readonly _aclRepository: AccessRepository) {
    super(userContext)
  }

  public async isPostModerator() {
    const user = this.getCurrentUser()
    if (user.role === 'moderator') {
      return this._aclRepository.hasAccess(user.id, Acl.MODERATE_POSTS)
    }
    return false
  }
}
