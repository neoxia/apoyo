import { IJwtVerifier, JwtVerifyException } from '@apoyo/jwt'
import { JwtRsaVerifier, JwtRsaVerifierProperties, VerifyProperties } from 'aws-jwt-verify/jwt-rsa'
import { JwtPayload as RsaJwtPayload } from 'aws-jwt-verify/jwt-model'

export interface IRsaJwtConfig extends JwtRsaVerifierProperties<VerifyProperties> {}

export interface IRsaJwtStrategy<O extends object> {
  authenticate(payload: RsaJwtPayload): Promise<O>
}

export { RsaJwtPayload }

export class RsaJwtManager<O extends object> implements IJwtVerifier<O> {
  private readonly _verifier: JwtRsaVerifier<any, any, any>

  constructor(config: IRsaJwtConfig, private readonly strategy: IRsaJwtStrategy<O>) {
    this._verifier = JwtRsaVerifier.create(config)
  }

  public async authenticate(token: string): Promise<O> {
    const jwt = await this._verify(token)
    return this.strategy.authenticate(jwt)
  }

  private async _verify(token: string) {
    try {
      return this._verifier.verify(token)
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new JwtVerifyException(err)
      }
      throw new JwtVerifyException()
    }
  }
}
