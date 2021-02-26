import { mkdirSync, accessSync } from 'fs'

export function mkdirIfNotExists (paths: string | string[]): boolean {
  if (!Array.isArray(paths)) paths = [paths]
  const results = paths.map(path => {
    if (!exists(path)) {
      mkdirSync(path, { recursive: true })
      return true
    }
    return false
  })
  return results.includes(true)
}

function exists (path: string): boolean {
  try {
    accessSync(path)
    return true
  } catch (error) {
    return false
  }
}
