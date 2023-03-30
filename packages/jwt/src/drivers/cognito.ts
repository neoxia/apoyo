import { IJwtVerifier } from '../contracts'
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model'
import { CognitoJwtVerifierProperties, CognitoJwtVerifier } from 'aws-jwt-verify/cognito-verifier'

export interface CognitoJwtConfig<O extends object> extends CognitoJwtVerifierProperties {
  decode(jwt: CognitoJwtPayload): Promise<O>
}

export class CognitoJwtManager<O extends object> implements IJwtVerifier<O> {
  private readonly _verifier: CognitoJwtVerifier<any, any, any>

  constructor(private readonly config: CognitoJwtConfig<O>) {
    this._verifier = CognitoJwtVerifier.create(config)
  }

  public async authenticate(token: string): Promise<O> {
    const jwt = await this._verify(token)
    return this.config.decode(jwt)
  }

  private async _verify(token: string) {
    return this._verifier.verify(token)
  }
}
