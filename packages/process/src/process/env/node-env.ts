import { Injectable } from '@apoyo/scopes'
import { Enum, Err, Str } from '@apoyo/std'

export enum NodeEnvironment {
  DEV = 'development',
  STAGING = 'staging',
  PROD = 'production',
  TEST = 'test'
}

const isValidEnv = Str.oneOf(Enum.values(NodeEnvironment))

export const $nodeEnv = Injectable.define<NodeEnvironment>(() => {
  const nodeEnv = process.env.NODE_ENV
  if (!nodeEnv) {
    return NodeEnvironment.PROD
  }
  if (isValidEnv(nodeEnv)) {
    return nodeEnv
  }
  const expected = Enum.values(NodeEnvironment)
  const msg = `Unsupported NODE_ENV environment variables. Received value ${JSON.stringify(
    nodeEnv
  )}, expected one of ${expected.join(', ')}`

  throw Err.of(msg, {
    received: nodeEnv,
    expected
  })
})
