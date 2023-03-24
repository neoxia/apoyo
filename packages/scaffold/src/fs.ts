export interface IFileSystem {
  list(glob: string[]): Promise<string[]>
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
   * @param glob - Check out the [glob](https://www.npmjs.com/package/glob) package for more information
   */
  list(glob: string[]): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  get(path: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  write(path: string, content: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delete(path: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
