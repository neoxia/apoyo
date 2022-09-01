import path from 'path'
import { Readable } from 'stream'

import { pipe, Str } from '@apoyo/std'

import {
  CannotCopyFileException,
  CannotGetMetaDataException,
  CannotMoveFileException,
  CannotReadFileException,
  FileException,
  FakeDriver,
  FakeDriverConfig
} from '../../src'

describe('Local driver | put', () => {
  it('write file to the destination', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')

    const contents = await driver.get('foo.txt')

    expect(contents.toString()).toBe('hello world')
  })

  it('create intermediate directories when missing', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('bar/baz/foo.txt', 'hello world')

    const contents = await driver.get('bar/baz/foo.txt')

    expect(contents.toString()).toBe('hello world')
  })

  it('overwrite destination when file already exists', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hi world')
    await driver.put('foo.txt', 'hello world')

    const contents = await driver.get('foo.txt')

    expect(contents.toString()).toBe('hello world')
  })
})

describe('Local driver | putStream', () => {
  it('write stream to a file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    const stream = new Readable({
      read() {
        this.push('hello world')
        this.push(null)
      }
    })

    expect(stream.readable).toBe(true)
    await driver.putStream('foo.txt', stream)
    expect(stream.readable).toBe(false)

    const contents = await driver.get('foo.txt')
    expect(contents.toString()).toBe('hello world')
  })

  it('create intermediate directories when writing a stream to a file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    const stream = new Readable({
      read() {
        this.push('hello world')
        this.push(null)
      }
    })

    expect(stream.readable).toBe(true)
    await driver.putStream('bar/baz/foo.txt', stream)
    expect(stream.readable).toBe(false)

    const contents = await driver.get('bar/baz/foo.txt')
    expect(contents.toString()).toBe('hello world')
  })

  it('overwrite existing file when stream to a file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    const stream = new Readable({
      read() {
        this.push('hello world')
        this.push(null)
      }
    })

    expect(stream.readable).toBe(true)
    await driver.put('foo.txt', 'hi world')
    await driver.putStream('foo.txt', stream)
    expect(stream.readable).toBe(false)

    const contents = await driver.get('foo.txt')
    expect(contents.toString()).toBe('hello world')
  })
})

describe('Local driver | exists', () => {
  it('return true when a file exists', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('bar/baz/foo.txt', 'bar')
    expect(await driver.exists('bar/baz/foo.txt')).toBe(true)
  })

  it("return false when a file doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    expect(await driver.exists('foo.txt')).toBe(false)
  })

  it("return false when a file parent directory doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    expect(await driver.exists('bar/baz/foo.txt')).toBe(false)
  })
})

describe('Local driver | delete', () => {
  it('remove file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('bar/baz/foo.txt', 'bar')
    await driver.delete('bar/baz/foo.txt')

    expect(await driver.exists('bar/baz/foo.txt')).toBe(false)
  })

  it('do not error when trying to remove a non-existing file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.delete('foo.txt')
    expect(await driver.exists('foo.txt')).toBe(false)
  })

  it("do not error when file parent directory doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.delete('bar/baz/foo.txt')
    expect(await driver.exists('bar/baz/foo.txt')).toBe(false)
  })
})

describe('Local driver | copy', () => {
  it('copy file from within the disk root', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.copy('foo.txt', 'bar.txt')

    const contents = await driver.get('bar.txt')
    expect(contents.toString()).toBe('hello world')
  })

  it('create intermediate directories when copying a file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.copy('foo.txt', 'baz/bar.txt')

    const contents = await driver.get('baz/bar.txt')
    expect(contents.toString()).toBe('hello world')
  })

  it("return error when source doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    try {
      await driver.copy('foo.txt', 'bar.txt')
    } catch (error) {
      expect(error).toBeInstanceOf(FileException)
      expect(error).toBeInstanceOf(CannotCopyFileException)
      expect(error.message).toBe('Cannot copy file from "foo.txt" to "bar.txt"')
    }
  })

  it('overwrite destination when already exists', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.put('bar.txt', 'hi world')
    await driver.copy('foo.txt', 'bar.txt')

    const contents = await driver.get('bar.txt')
    expect(contents.toString()).toBe('hello world')
  })
})

describe('Local driver | move', () => {
  it('move file from within the disk root', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.move('foo.txt', 'bar.txt')

    const contents = await driver.get('bar.txt')
    expect(contents.toString()).toBe('hello world')
    expect(await driver.exists('foo.txt')).toBe(false)
  })

  it('create intermediate directories when moving a file', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.move('foo.txt', 'baz/bar.txt')

    const contents = await driver.get('baz/bar.txt')
    expect(contents.toString()).toBe('hello world')
    expect(await driver.exists('foo.txt')).toBe(false)
  })

  it("return error when source doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    try {
      await driver.move('foo.txt', 'baz/bar.txt')
    } catch (error) {
      expect(error).toBeInstanceOf(FileException)
      expect(error).toBeInstanceOf(CannotMoveFileException)
      expect(error.message).toBe('Cannot move file from "foo.txt" to "baz/bar.txt"')
    }
  })

  it('overwrite destination when already exists', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')
    await driver.put('baz/bar.txt', 'hi world')

    await driver.move('foo.txt', 'baz/bar.txt')

    const contents = await driver.get('baz/bar.txt')
    expect(contents.toString()).toBe('hello world')
  })
})

describe('Local driver | get', () => {
  it('get file contents', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')

    const contents = await driver.get('foo.txt')
    expect(contents.toString()).toBe('hello world')
  })

  it('get file contents as a stream', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')

    const stream = await driver.getStream('foo.txt')

    await new Promise<void>((resolve) => {
      stream.on('data', (chunk) => {
        expect(chunk.toString()).toBe('hello world')
        resolve()
      })
    })
  })

  it("return error when file doesn't exists", async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    try {
      await driver.get('foo.txt')
    } catch (error) {
      expect(error).toBeInstanceOf(FileException)
      expect(error).toBeInstanceOf(CannotReadFileException)
      expect(error.message).toBe('Cannot read file from location "foo.txt"')
    }
  })
})

describe('Local driver | getStats', () => {
  it('get file stats', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    await driver.put('foo.txt', 'hello world')

    const stats = await driver.getStats('foo.txt')
    expect(stats.size).toBe(11)
    expect(stats.modified).toBeInstanceOf(Date)
  })

  it('return error when file is missing', async () => {
    const config: FakeDriverConfig = {}
    const driver = new FakeDriver(config)

    try {
      await driver.getStats('foo.txt')
    } catch (error) {
      expect(error).toBeInstanceOf(FileException)
      expect(error).toBeInstanceOf(CannotGetMetaDataException)
      expect(error.message).toBe('Unable to retrieve the "stats" for file at location "foo.txt"')
    }
  })
})

describe('Local driver | getUrl', () => {
  it('get url to a given file', async () => {
    const config: FakeDriverConfig = {
      serveFiles: {
        makeUrl(location) {
          return (
            '/uploads/' +
            pipe(
              location,
              Str.replace(path.sep, '/'),
              Str.trimWhile((c) => c === '/')
            )
          )
        },
        makeSignedUrl(location, _options) {
          return (
            '/uploads/' +
            pipe(
              location,
              Str.replace(path.sep, '/'),
              Str.trimWhile((c) => c === '/')
            ) +
            '?sign=xxxx'
          )
        }
      }
    }
    const driver = new FakeDriver(config)

    const url = await driver.getUrl('foo.txt')
    expect(url).toBe('/uploads/foo.txt')
  })
})

describe('Local driver | getSignedUrl', () => {
  it('get signed url to a given file', async () => {
    const config: FakeDriverConfig = {
      serveFiles: {
        makeUrl(location) {
          return (
            '/uploads/' +
            pipe(
              location,
              Str.replace(path.sep, '/'),
              Str.trimWhile((c) => c === '/')
            )
          )
        },
        makeSignedUrl(location, _options) {
          return (
            '/uploads/' +
            pipe(
              location,
              Str.replace(path.sep, '/'),
              Str.trimWhile((c) => c === '/')
            ) +
            '?sign=xxxx'
          )
        }
      }
    }
    const driver = new FakeDriver(config)

    const url = await driver.getSignedUrl('foo.txt')
    expect(url).toMatch(/\/uploads\/foo\.txt\?sign=.*/)
  })
})
