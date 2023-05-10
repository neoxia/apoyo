import path from 'path'
import {
  Event,
  FileCreatedEvent,
  FileDeletedEvent,
  FileEventsLogger,
  FileModifiedEvent,
  FileSkippedEvent
} from '../src'

describe('FileEventsLogger', () => {
  const log = jest.fn()
  const logger = new FileEventsLogger({
    logger: {
      info: log
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('on', () => {
    it('should print correct message for FileCreatedEvent', async () => {
      await logger.on(new FileCreatedEvent(path.resolve(__dirname, 'test.txt')))

      expect(log).toHaveBeenCalled()
      expect(log.mock.calls[0][0]).toMatchInlineSnapshot(`"[32mCREATED    tests\\\\test.txt[39m"`)
    })

    it('should print correct message for FileModifiedEvent', async () => {
      await logger.on(new FileModifiedEvent(path.resolve(__dirname, 'test.txt')))

      expect(log).toHaveBeenCalled()
      expect(log.mock.calls[0][0]).toMatchInlineSnapshot(`"[35mMODIFIED   tests\\\\test.txt[39m"`)
    })

    it('should print correct message for FileDeletedEvent', async () => {
      await logger.on(new FileDeletedEvent(path.resolve(__dirname, 'test.txt')))

      expect(log).toHaveBeenCalled()
      expect(log.mock.calls[0][0]).toMatchInlineSnapshot(`"[31mDELETED    tests\\\\test.txt[39m"`)
    })

    it('should print correct message for FileSkippedEvent', async () => {
      await logger.on(new FileSkippedEvent(path.resolve(__dirname, 'test.txt')))

      expect(log).toHaveBeenCalled()
      expect(log.mock.calls[0][0]).toMatchInlineSnapshot(`"[33mSKIPPED    tests\\\\test.txt[39m"`)
    })

    it('should ignore any other event', async () => {
      await logger.on(new Event())
      expect(log).not.toHaveBeenCalled()
    })
  })
})
