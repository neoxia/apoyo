import { Injectable } from '@apoyo/scopes'

/**
 * Returns by default the current working directory
 *
 * You can override this injectable to customize the root directory
 */
export const $rootDir = Injectable.define(() => process.cwd())
