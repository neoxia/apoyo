import { IJwtVerifier, JwtInvalidPayloadException, JwtVerifyException } from '@apoyo/jwt'
import { verifyAzureToken, DecodeOptions } from 'azure-ad-jwt-lite'
import { JwtPayload } from 'jsonwebtoken'

export interface IAzureJwtConfig extends DecodeOptions {}

export interface IAzureJwtStrategy<O extends object> {
  authenticate(jwt: JwtPayload): Promise<O>
}

export class AzureJwtManager<O extends object> implements IJwtVerifier<O> {
  constructor(private readonly config: IAzureJwtConfig, private readonly strategy: IAzureJwtStrategy<O>) {}

  public async authenticate(token: string): Promise<O> {
    const payload = await this._verify(token)

    if (typeof payload !== 'object' || payload === null) {
      throw new JwtInvalidPayloadException()
    }

    return this.strategy.authenticate(payload)
  }

  private async _verify(token: string) {
    try {
      return verifyAzureToken(token, this.config)
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new JwtVerifyException(err)
      }
      throw new JwtVerifyException()
    }
  }
}
