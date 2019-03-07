import { NoopLoggerFilter } from './filter/noop.logger.filter'
import { LOG_LEVEL, Logger, TAG_DEFAULT } from './logger.model'
import { LoggerService } from './logger.service'
import { ConsoleLoggerTransport } from './transport/console.logger.transport'
import { NoopLoggerTransport } from './transport/noop.logger.transport'

const noopTransport = new NoopLoggerTransport()
const transportMock = jest.spyOn(noopTransport, 'send')

const consoleTransport = new ConsoleLoggerTransport()
const consoleTransportMock = jest.spyOn(consoleTransport, 'send')

const noopFilter = new NoopLoggerFilter()
const noopFilterMock = jest.spyOn(noopFilter, 'filter')

beforeEach(() => {
  jest.resetAllMocks()
})

describe('minimal logger with debug level', () => {
  const logService = new LoggerService({
    transports: [noopTransport],
    tagLevels: {
      [TAG_DEFAULT]: LOG_LEVEL.DEBUG,
    },
  })

  test('basic api', () => {
    const log = logService.getLogger()
    callBasicAPI(log)
    expect(transportMock).toMatchSnapshot()
  })

  test('basic api with tag1', () => {
    const log = logService.getLogger().tag('tag1')
    callBasicAPI(log)
    expect(transportMock).toMatchSnapshot()
  })

  test('deduplicate tags', () => {
    const log = logService.getLogger().tag('tag1')
    log.tag('tag1').info('hello')
    expect(transportMock).toMatchSnapshot()
  })
})

describe('minimal logger with default levels', () => {
  const logService = new LoggerService({
    transports: [noopTransport],
  })

  test('basic api', () => {
    const log = logService.getLogger()
    callBasicAPI(log)
    // should ignore debug level
    expect(transportMock).toMatchSnapshot()
  })

  test('basic meta', () => {
    const log = logService.getLogger()
    log.meta({ a: 'a', n: 1 }).info('hello')
    expect(transportMock).toMatchSnapshot()
  })
})

describe('tag1:WARN', () => {
  const logService = new LoggerService({
    transports: [noopTransport],
    tagLevels: {
      tag1: LOG_LEVEL.WARN,
    },
  })

  test('tag1 to be filtered out', () => {
    const log = logService.getLogger()
    log.info('hello_notag') // pass
    log.tag('tag1').debug('hello_tag1')
    log.tag('tag1').info('hello_tag1')
    log.tag('tag1', 'tag2').info('hello_tag1')
    expect(transportMock).toHaveBeenCalledTimes(1)
  })

  test('tag1 to be filtered out with default tag1', () => {
    const log = logService.getLogger().tag('tag1')
    log.info('hello_notag')
    log.tag('tag1').info('hello_tag1') // will be deduplicated
    log.tag('tag2').info('hello_tag1') // still filtered out because of tag1
    log.warn('hello_warn') // will pass
    expect(transportMock).toHaveBeenCalledTimes(1)
  })
})

describe('TAG_DEFAULT:WARN;tag1:INFO', () => {
  const logService = new LoggerService({
    transports: [noopTransport],
    tagLevels: {
      [TAG_DEFAULT]: LOG_LEVEL.WARN,
      tag1: LOG_LEVEL.INFO,
    },
  })

  test('tag1 to pass', () => {
    const log = logService.getLogger()
    log.info('hello') // out
    log.warn('hello_warn') // pass
    log.tag('tag1').info('hello_tag1') // pass
    log.tag('tag1', 'tag2').info('hello_tag1') // out, cause all tags should pass
    expect(transportMock).toHaveBeenCalledTimes(2)
  })
})

describe('edge cases for coverage', () => {
  test('LoggerService with default opts', () => {
    new LoggerService()
  })

  test('ConsoleTransport', () => {
    const logService = new LoggerService({
      transports: [consoleTransport],
    })
    const log = logService.getLogger()
    log() // won't be called, 0 args
    log.log(LOG_LEVEL.INFO, 'hello') // called once
    log.tag().info() // won't be called, 0 args
    expect(consoleTransportMock).toHaveBeenCalledTimes(1)

    // for coverage
    consoleTransportMock.mockRestore()
    log('hello')
    log.log(LOG_LEVEL.DISABLED, 'hello')
  })

  test('noopFilter', () => {
    const logService = new LoggerService({
      transports: [noopTransport],
      filters: [noopFilter],
    })
    const log = logService.getLogger()
    log('hello')
    expect(noopFilterMock).toHaveBeenCalledTimes(1)

    jest.restoreAllMocks()
    log('hello') // for coverage
  })
})

function callBasicAPI (log: Logger): void {
  log('hello')
  log.debug('hello')
  log.info('hello')
  log.warn('hello')
  log.error('hello')
}
