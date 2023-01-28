import { NotAuthenticatedException, UserContext } from '../../src'
import { User } from './types'

export enum Acl {
  WRITE_POSTS = 'write:posts',
  MODERATE_POSTS = 'moderate:posts'
}

export class AclRepository {
  public async hasAccess(_userId: string, _acl: Acl): Promise<boolean> {
    return true
  }
}

export class CommonPolicyContext {
  constructor(private readonly _userContext: UserContext<User>, private readonly _aclRepository: AclRepository) {}

  public getCurrentUser(): User
  public getCurrentUser(options: { allowGuest: false }): User
  public getCurrentUser(options: { allowGuest: true }): User | null
  public getCurrentUser(options: { allowGuest: boolean } = { allowGuest: false }): User | null {
    const allowGuest = options?.allowGuest ?? false
    const user = this._userContext.getUser()
    if (!allowGuest && !user) {
      throw new NotAuthenticatedException()
    }
    return user
  }

  public hasAccess(user: User, acl: Acl) {
    return this._aclRepository.hasAccess(user.id, acl)
  }
}
