import path from 'path'
import { LocalFileSystem } from '../src'

describe('LocalFileSystem', () => {
  describe('list', () => {
    it('should list template files correctly', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      const files = await fs.list('**/*')

      expect(files).toEqual([
        'prepend-hello-world.ejs',
        'append-hello-world.ejs',
        'add-hello-world.ejs',
        'static/README.md',
        'static/.gitignore',
        'static/.env.development'
      ])

      const staticFiles = await fs.cd('static').list('**/*')

      expect(staticFiles).toEqual(['README.md', '.gitignore', '.env.development'])
    })

    it('should list only files matching the patterns', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      const files = await fs.list(['static/.gitignore', 'static/.env*'])

      expect(files).toEqual(['static/.gitignore', 'static/.env.development'])
    })
  })

  describe('exists', () => {
    it('should return true if file exists', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      expect(await fs.exists('static/.env.development')).toBeTruthy()
    })

    it('should return false if file does not exists', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      expect(await fs.exists('static/.env.production')).toBeFalsy()
    })
  })

  describe('get', () => {
    it('should return file content', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      expect(await fs.get('static/.env.development')).toMatchInlineSnapshot(`"PORT=3000"`)
    })

    it('should throw if file was not found', async () => {
      const fs = new LocalFileSystem({
        rootDir: path.resolve(__dirname, './templates')
      })

      expect(fs.get('static/.env.production')).rejects.toThrow()
    })
  })

  describe('write', () => {
    it.todo('should write file content correctly')
    it.todo('should create subfolders correctly')
  })

  describe('delete', () => {
    it.todo('should delete file correctly')
  })
})
