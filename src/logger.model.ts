import { StringMap } from '@naturalcycles/js-lib'

export const TAG_DEFAULT = 'TAG_DEFAULT'

export enum LOG_LEVEL {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DISABLED = 'DISABLED',
}

export const LOG_LEVEL_ORDER: StringMap<number> = {
  [LOG_LEVEL.DEBUG]: 1,
  [LOG_LEVEL.INFO]: 2,
  [LOG_LEVEL.WARN]: 3,
  [LOG_LEVEL.ERROR]: 4,
  [LOG_LEVEL.DISABLED]: 5,
}

export interface LoggerServiceOpts {
  /**
   * @default ConsoleLoggerTransport
   */
  transports: LoggerTransport[]

  /**
   * @default no filters (empty array)
   */
  filters: LoggerFilter[]

  /**
   * Logging level per tag.
   * @default INFO level for all tag.
   */
  tagLevels: {
    [tag: string]: LOG_LEVEL
  }
}

// ILogger with aliases
export interface Logger extends ILogger {
  (...args: any[]): void // alias for .info()
  debug (...args: any[]): void // only useful in development or if something is wrong
  info (...args: any[]): void // default level. Useful for tracing back issues in production (issues that happened in the past)
  warn (...args: any[]): void // not normal behaviour, potential error (can lead to error), but not a hard error
  error (...args: any[]): void // hard error, should not happen normally. We always strive to have 0 errors

  getTags (): string[]
  getMeta (): any
}

// tslint:disable-next-line:interface-name
export interface ILogger {
  /**
   * Log with specified level.
   */
  log (level: LOG_LEVEL, ...args: any[]): void

  /**
   * Append (not override) tags.
   */
  tag (...tags: string[]): Logger

  /**
   * Merge (not override) metadata.
   */
  meta (meta: StringMap<any>): Logger
}

export interface LogObject {
  args: any[]
  level: LOG_LEVEL
  tags: string[]
  meta?: StringMap<any>
}

export interface LoggerTransport {
  send (o: LogObject): void // not a Promise<void> to simplify the API
}

export interface LoggerFilter {
  filter (o: LogObject): LogObject
}
