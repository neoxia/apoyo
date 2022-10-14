import { Implementation } from '@apoyo/ioc'

/**
 * Returns by default the current working directory
 *
 * You can override this injectable to customize the root directory
 */
export const $rootDir = Implementation.create(() => process.cwd())
