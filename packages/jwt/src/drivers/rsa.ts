import { IJwtVerifier } from '../contracts'
import { JwtRsaVerifier, JwtRsaVerifierProperties, VerifyProperties } from 'aws-jwt-verify/jwt-rsa'
import { JwtPayload } from 'aws-jwt-verify/jwt-model'

export interface IRsaJwtConfig extends JwtRsaVerifierProperties<VerifyProperties> {}

export interface IRsaJwtStrategy<O extends object> {
  authenticate(payload: JwtPayload): Promise<O>
}

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
    return this._verifier.verify(token)
  }
}
