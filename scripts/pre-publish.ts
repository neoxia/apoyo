import { run } from './run'

const main = async () => {
  throw new Error('"npm publish" can not be run from root, run "npm run release" instead')
}

run(main)
