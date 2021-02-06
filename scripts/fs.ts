import { promises as fs } from 'fs'
import G from 'glob'
import { promisify } from 'util'

export const readFile = fs.readFile
export const writeFile = fs.writeFile
export const copyFile = fs.copyFile
export const glob = promisify(G)
export const mkdir = fs.mkdir
export const moveFile = fs.rename
