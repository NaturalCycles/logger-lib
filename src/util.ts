function checkIsNode (): boolean {
  return typeof process !== 'undefined'
}

export const isNode = checkIsNode()
