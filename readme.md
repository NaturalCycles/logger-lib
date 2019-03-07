## @naturalcycles/logger-lib

> PoC: Opinionated logger for Node.js and Browser

[![npm](https://img.shields.io/npm/v/@naturalcycles/logger-lib/latest.svg)](https://www.npmjs.com/package/@naturalcycles/logger-lib)
[![](https://circleci.com/gh/NaturalCycles/logger-lib.svg?style=shield&circle-token=cbb20b471eb9c1d5ed975e28c2a79a45671d78ea)](https://circleci.com/gh/NaturalCycles/logger-lib)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Features

- Opinionated api
- Pluggable Transports and Filters
- Flexible filtering by tags (debug-style) and log levels (DEBUG, INFO, WARN, ERROR)
- Built-in NoopTransport, NoopFilter, ConsoleTransport (prints everything via `console.*` methods)
- Built with TypeScript (types included)

# Usage

```typescript
// Minimal LoggerService
const logService = new LoggerService()

// Minimal Logger
let log = logService.getLogger()

// Filename as the only tag (node)
log = logService.getLogger(__filename)

// More tags that will be attached to every log message
log = logService.getLogger(__filename, 'tag1', 'tag2')

// Normal logging (will be used 80% of the time)
log('something')

// Supports multiple parameters, same as console.*
log('something', { a: 'b' }, { b: 'c' }, 'somethingElse')

// Specific level
log.debug('something')
log.info('something')
log.warn('something')
log.error('something')
log.log(LEVEL.INFO, 'something')

// Add tag to specific log message
log.tag('tag3').info('something')

// Add many tags to specific log message
log.tag('tag3', 'tag4').info('something')

// Custom level + tag
log.tag('tag1').warn('something')

// Meta (passed to Transports to deal with)
log.meta({ a: 'b' }).info('something')
```

# Packaging

- `engines.node >= 10.13`: Latest Node.js LTS
- `main: dist/index.js`: commonjs, es2018
- `types: dist/index.d.ts`: typescript types
- `/src` folder with source `*.ts` files included
