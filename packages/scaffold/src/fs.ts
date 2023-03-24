import * as fs from 'fs/promises'
import { glob } from 'glob'
import { resolve, dirname } from 'path'

export interface IFileSystem {
  list(globs: string[]): Promise<string[]>
  get(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  delete(path: string): Promise<void>
}

export interface LocalFileSystemOptions {
  rootDir: string
}

export class LocalFileSystem implements IFileSystem {
  constructor(private readonly options: LocalFileSystemOptions) {}

  /**
   * List files using the specified glob patterns
   *
   * @param pattern - Check out the [glob](https://www.npmjs.com/package/glob) package for more information
   */
  public async list(pattern: string | string[]): Promise<string[]> {
    return glob(pattern, {
      nodir: true,
      cwd: this.options.rootDir
    })
  }

  public async get(path: string): Promise<string> {
    return fs.readFile(this._makePath(path), {
      encoding: 'utf-8'
    })
  }

  public async write(path: string, content: string): Promise<void> {
    const dest = this._makePath(path)
    await fs.mkdir(dirname(dest), {
      recursive: true
    })
    await fs.writeFile(dest, content, {
      encoding: 'utf-8'
    })
  }

  public async delete(path: string): Promise<void> {
    await fs.unlink(this._makePath(path))
  }

  private _makePath(path: string) {
    return resolve(this.options.rootDir, path)
  }
}
