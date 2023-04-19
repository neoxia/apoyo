import { IJwtVerifier, JwtException, JwtVerifyException } from '@apoyo/jwt'
import { JwtRsaVerifier, JwtRsaVerifierProperties, VerifyProperties } from 'aws-jwt-verify/jwt-rsa'
import { JwtPayload as RsaJwtPayload } from 'aws-jwt-verify/jwt-model'

export interface IRsaJwtConfig extends JwtRsaVerifierProperties<VerifyProperties> {}

export interface IRsaJwtStrategy<O extends object> {
  authenticate(payload: RsaJwtPayload): Promise<O | null>
}

export { RsaJwtPayload }

export class RsaJwtManager<O extends object> implements IJwtVerifier<O> {
  private readonly _verifier: JwtRsaVerifier<any, any, any>

  constructor(config: IRsaJwtConfig, private readonly strategy: IRsaJwtStrategy<O>) {
    this._verifier = JwtRsaVerifier.create(config)
  }

  public async authenticate(token: string): Promise<O | null> {
    try {
      const jwt = await this._verify(token)
      return await this.strategy.authenticate(jwt)
    } catch (err) {
      if (err instanceof JwtException) {
        return null
      }
      throw err
    }
  }

  private async _verify(token: string) {
    try {
      return this._verifier.verify(token)
    } catch (err: unknown) {
      throw new JwtVerifyException(err instanceof Error ? err : undefined)
    }
  }
}
