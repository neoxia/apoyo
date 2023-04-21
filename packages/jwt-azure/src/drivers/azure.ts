import { IJwtVerifier, JwtInvalidPayloadException, JwtVerifyException, JwtException } from '@apoyo/jwt'
import { verifyAzureToken, DecodeOptions } from 'azure-ad-jwt-lite'
import { JwtPayload as AzureJwtPayload } from 'jsonwebtoken'

export interface IAzureJwtConfig extends DecodeOptions {}

export interface IAzureJwtStrategy<O extends object> {
  verify(jwt: AzureJwtPayload): Promise<O | null>
}

export { AzureJwtPayload }

export class AzureJwtManager<O extends object> implements IJwtVerifier<O> {
  constructor(private readonly config: IAzureJwtConfig, private readonly strategy: IAzureJwtStrategy<O>) {}

  public async verify(token: string): Promise<O | null> {
    try {
      const payload = await this._verify(token)

      if (typeof payload !== 'object' || payload === null) {
        throw new JwtInvalidPayloadException()
      }

      return await this.strategy.verify(payload)
    } catch (err) {
      if (err instanceof JwtException) {
        return null
      }
      throw err
    }
  }

  private async _verify(token: string) {
    try {
      return verifyAzureToken(token, this.config)
    } catch (err: unknown) {
      throw new JwtVerifyException(err instanceof Error ? err : undefined)
    }
  }
}
