export interface IJwtVerifier<O> {
  verify(token: string): Promise<O | null>
}

export interface IJwtSigner<I> {
  sign(payload: I): Promise<string>
}
