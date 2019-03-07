import { LoggerTransport, LogObject } from '../logger.model'

export class NoopLoggerTransport implements LoggerTransport {
  send (logObject: LogObject): void {
    // no-op, as advertised:)
  }
}
