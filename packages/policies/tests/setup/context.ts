import { PolicyContext, UserContext } from '../../src'
import { User } from './types'

export class AclRepository {
  public async hasAcl(_userId: string, _acl: string): Promise<boolean> {
    return true
  }
}

export class AppPolicyContext extends PolicyContext<User> {
  constructor(userContext: UserContext<User>, private readonly _aclRepository: AclRepository) {
    super(userContext)
  }

  public async hasAcl(acl: string) {
    const user = this.getCurrentUser()
    return this._aclRepository.hasAcl(user.id, acl)
  }
}
