import { Readable } from 'stream'

import {
  CannotCopyFileException,
  CannotGetMetaDataException,
  CannotMoveFileException,
  CannotReadFileException,
  LocationException,
  FileException
} from '@apoyo/files'
import { AzureDrive, AzureDriveConfig } from '../src'
import { Arr, Dict, pipe } from '@apoyo/std'

describe('Azure Drive', () => {
  let drive: AzureDrive

  beforeEach(async () => {
    // Check https://github.com/Azure/Azurite#usage-with-azure-storage-sdks-or-tools for more information.
    const config: AzureDriveConfig = {
      container: 'test',
      prefix: 'development',
      accountName: 'devstoreaccount1',
      accountKey: 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
      localAddress: 'http://devstoreaccount1.blob.localhost:10000'
    }

    drive = new AzureDrive(config)

    const containerClient = drive.adapter.getContainerClient('test')
    await containerClient.deleteIfExists()
    await containerClient.create()
  })

  describe('put', () => {
    it('write file to the destination', async () => {
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')

      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when missing', async () => {
      await drive.put('bar/baz/foo.txt', 'hello world')

      const contents = await drive.get('bar/baz/foo.txt')

      expect(contents.toString()).toBe('hello world')
    })

    it('overwrite destination when file already exists', async () => {
      await drive.put('foo.txt', 'hi world')
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')

      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('putStream', () => {
    it('write stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.putStream('foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when writing a stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.putStream('bar/baz/foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('bar/baz/foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('overwrite existing file when stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.put('foo.txt', 'hi world')
      await drive.putStream('foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('exists', () => {
    it('return true when a file exists', async () => {
      await drive.put('bar/baz/foo.txt', 'bar')
      expect(await drive.exists('bar/baz/foo.txt')).toBe(true)
    })

    it("return false when a file doesn't exists", async () => {
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("return false when a file parent directory doesn't exists", async () => {
      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })
  })

  describe('delete', () => {
    it('remove file', async () => {
      await drive.put('bar/baz/foo.txt', 'bar')
      await drive.delete('bar/baz/foo.txt')

      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })

    it('do not error when trying to remove a non-existing file', async () => {
      await drive.delete('foo.txt')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("do not error when file parent directory doesn't exists", async () => {
      await drive.delete('bar/baz/foo.txt')
      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })
  })

  describe('copy', () => {
    it('copy file from within the disk root', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.copy('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when copying a file', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.copy('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it("return error when source doesn't exists", async () => {
      try {
        await drive.copy('foo.txt', 'bar.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotCopyFileException)
        expect(error.message).toBe('Cannot copy file from "foo.txt" to "bar.txt"')
      }
    })

    it('overwrite destination when already exists', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.put('bar.txt', 'hi world')
      await drive.copy('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('move', () => {
    it('move file from within the disk root', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.move('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it('create intermediate directories when moving a file', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.move('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("return error when source doesn't exists", async () => {
      try {
        await drive.move('foo.txt', 'baz/bar.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotMoveFileException)
        expect(error.message).toBe('Cannot move file from "foo.txt" to "baz/bar.txt"')
      }
    })

    it('overwrite destination when already exists', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.put('baz/bar.txt', 'hi world')

      await drive.move('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('get', () => {
    it('get file contents', async () => {
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('get file contents as a stream', async () => {
      await drive.put('foo.txt', 'hello world')

      const stream = await drive.getStream('foo.txt')

      await new Promise<void>((resolve) => {
        stream.on('data', (chunk) => {
          expect(chunk.toString()).toBe('hello world')
          resolve()
        })
      })
    })

    it("return error when file doesn't exists", async () => {
      try {
        await drive.get('foo.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotReadFileException)
        expect(error.message).toBe('Cannot read file from location "foo.txt"')
      }
    })
  })

  describe('getStats', () => {
    it('get file stats', async () => {
      await drive.put('foo.txt', 'hello world')

      const stats = await drive.getStats('foo.txt')
      expect(stats.size).toBe(11)
      expect(stats.modified).toBeInstanceOf(Date)
    })

    it('return error when file is missing', async () => {
      try {
        await drive.getStats('foo.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotGetMetaDataException)
        expect(error.message).toBe('Unable to retrieve the "stats" for file at location "foo.txt"')
      }
    })
  })

  describe('getUrl', () => {
    it('get url to a given file', async () => {
      const url = await drive.getUrl('bar/foo.txt')
      expect(url).toBe('http://devstoreaccount1.blob.localhost:10000/test/development%2Fbar%2Ffoo.txt')
    })
  })

  describe('getSignedUrl', () => {
    it('get signed url to a given file', async () => {
      const url = await drive.getSignedUrl('bar/foo.txt')
      const parsed = new URL(url)
      const queryParams = pipe(parsed.searchParams.entries(), Arr.from, Dict.fromPairs)
      expect(parsed.origin + parsed.pathname).toBe(
        'http://devstoreaccount1.blob.localhost:10000/test/development%2Fbar%2Ffoo.txt'
      )
      expect(queryParams).toEqual(
        expect.objectContaining({
          sig: expect.anything()
        })
      )
    })
  })

  describe('makePath', () => {
    it('should reject invalid locations', async () => {
      const invalidLocations = [
        `foo/../bar.txt`, // Reserved filename
        `foo\\bar.txt`, // Illegal chars
        `foo/<bar>.txt` // Illegal chars
      ]

      for (const invalidLocation of invalidLocations) {
        await expect(drive.get(invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.put(invalidLocation, 'Invalid')).rejects.toThrow(LocationException)
        await expect(drive.delete(invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.copy(invalidLocation, invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.move(invalidLocation, invalidLocation)).rejects.toThrow(LocationException)
      }
    })
  })
})
