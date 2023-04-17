import { Algorithm as LocalJwtAlgorithm, JwtPayload as LocalJwtPayload, sign, verify } from 'jsonwebtoken'

import { IJwtSigner, IJwtVerifier } from '../contracts'
import { JwtInvalidPayloadException, JwtVerifyException } from '../exceptions'

export interface ILocalJwtVerifierConfig {
  algorithm: LocalJwtAlgorithm
  issuer: string
  audience: string
  secretOrPublicKey: string
}

export interface ILocalJwtSignerConfig {
  algorithm: LocalJwtAlgorithm
  expiresIn: string | number
  issuer: string
  audience: string
  secretOrPrivateKey: string
}

export type ILocalJwtConfig = ILocalJwtSignerConfig & ILocalJwtVerifierConfig

export interface ILocalJwtStrategy<I extends object, O extends object> {
  build(input: I): Promise<LocalJwtPayload>
  authenticate(payload: LocalJwtPayload): Promise<O>
}

export { LocalJwtAlgorithm, LocalJwtPayload }

export class LocalJwtManager<I extends object, O extends object> implements IJwtVerifier<O>, IJwtSigner<I> {
  constructor(private readonly config: ILocalJwtConfig, private readonly strategy: ILocalJwtStrategy<I, O>) {}

  public async sign(input: I): Promise<string> {
    const payload = await this.strategy.build(input)

    return sign(payload, this.config.secretOrPrivateKey, {
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
      expiresIn: this.config.expiresIn
    })
  }

  public async authenticate(token: string): Promise<O> {
    const payload = this._verify(token)

    if (typeof payload !== 'object' || payload === null) {
      throw new JwtInvalidPayloadException()
    }

    return this.strategy.authenticate(payload)
  }

  private _verify(token: string) {
    try {
      return verify(token, this.config.secretOrPublicKey, {
        algorithms: this.config.algorithm ? [this.config.algorithm] : undefined,
        issuer: this.config.issuer,
        audience: this.config.audience,
        complete: false
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new JwtVerifyException(err)
      }
      throw new JwtVerifyException()
    }
  }
}
