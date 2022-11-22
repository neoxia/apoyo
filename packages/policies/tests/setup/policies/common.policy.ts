import { Acl, CommonPolicyContext } from '../context'

export namespace CommonPolicy {
  /**
   * Early exit policy check if user is admin
   */
  export async function* isAdmin(ctx: CommonPolicyContext) {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (user?.role === 'admin') {
      yield true
    }
  }

  /**
   * Early fails policy check if user does not have the given role
   */
  export async function* requireRole(ctx: CommonPolicyContext, role: string) {
    if (ctx.getCurrentUser().role !== role) {
      yield false
    }
  }

  /**
   * Early fails policy check if user is not connected or if he does not have the required acl
   */
  export async function* requireAcl(ctx: CommonPolicyContext, acl: Acl) {
    const hasAcl = await ctx.hasAccess(ctx.getCurrentUser(), acl)
    if (!hasAcl) {
      yield false
    }
  }

  export async function* before(ctx: CommonPolicyContext) {
    yield* isAdmin(ctx)
  }
}
