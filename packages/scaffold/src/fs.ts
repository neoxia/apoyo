import * as fs from 'fs/promises'
import { glob } from 'glob'
import { resolve, dirname } from 'path'

export interface IFileSystem {
  list(globs: string[]): Promise<string[]>
  exists(path: string): Promise<boolean>
  get(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  delete(path: string): Promise<void>
  cd(directory: string): IFileSystem
  resolve(path: string): string
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
    const files = await glob(pattern, {
      dot: true,
      nodir: true,
      cwd: this.options.rootDir
    })

    return files.map((file) => file.replace(/\\/g, '/'))
  }

  public async exists(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(this.resolve(path))
      return stat.isFile()
    } catch (err) {
      return false
    }
  }

  public async get(path: string): Promise<string> {
    return fs.readFile(this.resolve(path), {
      encoding: 'utf-8'
    })
  }

  public async write(path: string, content: string): Promise<void> {
    const dest = this.resolve(path)
    await fs.mkdir(dirname(dest), {
      recursive: true
    })
    await fs.writeFile(dest, content, {
      encoding: 'utf-8'
    })
  }

  public async delete(path: string): Promise<void> {
    await fs.unlink(this.resolve(path))
  }

  public cd(directory: string): LocalFileSystem {
    return new LocalFileSystem({
      rootDir: resolve(this.options.rootDir, directory)
    })
  }

  public resolve(path: string) {
    return resolve(this.options.rootDir, path)
  }
}
