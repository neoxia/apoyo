import { IJwtVerifier } from '@apoyo/jwt'
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model'
import { CognitoJwtVerifierProperties, CognitoJwtVerifier } from 'aws-jwt-verify/cognito-verifier'

export interface ICognitoJwtConfig extends CognitoJwtVerifierProperties {}

export interface ICognitoJwtStrategy<O extends object> {
  authenticate(jwt: CognitoJwtPayload): Promise<O>
}

export class CognitoJwtManager<O extends object> implements IJwtVerifier<O> {
  private readonly _verifier: CognitoJwtVerifier<any, any, any>

  constructor(config: ICognitoJwtConfig, private readonly strategy: ICognitoJwtStrategy<O>) {
    this._verifier = CognitoJwtVerifier.create(config)
  }

  public async authenticate(token: string): Promise<O> {
    const jwt = await this._verify(token)
    return this.strategy.authenticate(jwt)
  }

  private async _verify(token: string) {
    return this._verifier.verify(token)
  }
}
