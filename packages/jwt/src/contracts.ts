export interface IJwtVerifier<O> {
  authenticate(token: string): Promise<O>
}

export interface IJwtSigner<I> {
  sign(payload: I): Promise<string>
}
