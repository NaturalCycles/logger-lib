import { LoggerFilter, LogObject } from '../logger.model'

export class NoopLoggerFilter implements LoggerFilter {
  filter (logObject: LogObject): LogObject {
    return logObject
  }
}
