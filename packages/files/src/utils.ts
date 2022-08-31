import { promisify } from 'util'
import { pipeline } from 'stream'

export const pipelinePromise = promisify(pipeline)
