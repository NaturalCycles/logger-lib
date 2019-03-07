import { StringMap } from '@naturalcycles/js-lib'
import {
  ILogger,
  LOG_LEVEL,
  LOG_LEVEL_ORDER,
  Logger,
  LoggerServiceOpts,
  LogObject,
  TAG_DEFAULT,
} from './logger.model'

export class LoggerService {
  constructor (opts: Partial<LoggerServiceOpts> = {}) {
    this.opts = {
      // defaults
      transports: [],
      filters: [],
      // extra
      ...opts,

      // Override tagLevels
      tagLevels: {
        [TAG_DEFAULT]: LOG_LEVEL.INFO, // default
        ...opts.tagLevels,
      },
    }
  }

  private opts!: LoggerServiceOpts

  getLogger (): Logger {
    return createLogger(this.opts)
  }
}

function createLogger (
  opts: LoggerServiceOpts,
  defaultTags: string[] = [],
  defaultMeta?: StringMap<any>,
): Logger {
  const impl = new LoggerImpl(opts, defaultTags, defaultMeta)

  // Start with only alias function
  const logger: Logger = ((...args: any[]) => impl.log(LOG_LEVEL.INFO, ...args)) as any

  // Proxy all methods, cause there's no other way to "merge" function with class instance
  Object.assign(logger, {
    log: (level: LOG_LEVEL, ...args: any[]) => impl.log(level, ...args),
    debug: (...args: any[]) => impl.log(LOG_LEVEL.DEBUG, ...args),
    info: (...args: any[]) => impl.log(LOG_LEVEL.INFO, ...args),
    warn: (...args: any[]) => impl.log(LOG_LEVEL.WARN, ...args),
    error: (...args: any[]) => impl.log(LOG_LEVEL.ERROR, ...args),

    tag: (...tags: string[]) => {
      if (!tags.length) return logger
      return impl.tag(...tags)
    },
    meta: (meta: StringMap<any>) => impl.meta(meta),
  } as Logger)

  return logger
}

class LoggerImpl implements ILogger {
  constructor (
    private opts: LoggerServiceOpts,
    private defaultTags: string[],
    private defaultMeta?: StringMap<any>,
  ) {}

  log (level: LOG_LEVEL, ...args: any[]): void {
    if (!args.length) return

    //
    // 1. Construct LogObject
    //
    let logObject: LogObject = {
      args,
      level,
      tags: this.defaultTags,
      meta: this.defaultMeta,
    }

    //
    // 2. Check level
    // If at least one tag is above desired level - continue
    // Require ALL tag to be above the desired loglevel
    //
    const tags: string[] = logObject.tags.length ? logObject.tags : [TAG_DEFAULT]

    const proceed = tags.every(tag => {
      const tagLevel = this.opts.tagLevels[tag] || this.opts.tagLevels[TAG_DEFAULT]
      // if this logObject's level is above the minimum threshold log level
      return LOG_LEVEL_ORDER[logObject.level] >= LOG_LEVEL_ORDER[tagLevel]
    })
    if (!proceed) return // below log level

    //
    // 2. Filter
    //
    this.opts.filters.forEach(filter => {
      logObject = filter.filter(logObject)
    })

    //
    // 3. Transport
    //
    this.opts.transports.forEach(transport => {
      transport.send(logObject)
    })
  }

  meta (meta: StringMap<any>): Logger {
    return createLogger(this.opts, this.defaultTags, meta)
  }

  tag (...tags: string[]): Logger {
    return createLogger(this.opts, [...new Set([...this.defaultTags, ...tags])], this.defaultMeta)
  }
}
