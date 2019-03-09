import { LoggerService } from './logger.service'

test('should process __filename', () => {
  const loggerService = new LoggerService()
  const log = loggerService.getLogger(__filename)
  const tags = log.getTags()
  // console.log(tags)
  expect(tags).toEqual(['logger.service.test'])
})
