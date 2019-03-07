import { LOG_LEVEL, LoggerTransport, LogObject } from '../logger.model'

const CONSOLE_METHOD_MAP = {
  [LOG_LEVEL.DEBUG]: 'debug',
  [LOG_LEVEL.INFO]: 'log',
  [LOG_LEVEL.WARN]: 'warn',
  [LOG_LEVEL.ERROR]: 'error',
}

const DEF_METHOD = 'log'

export class ConsoleLoggerTransport implements LoggerTransport {
  send (o: LogObject): void {
    console[CONSOLE_METHOD_MAP[o.level] || DEF_METHOD](...o.args)
  }
}
