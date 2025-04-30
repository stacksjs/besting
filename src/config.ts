import type { BestingConfig } from './types'
import { resolve } from 'node:path'
import { loadConfig } from 'bunfig'

/**
 * Default configuration for the router
 */
export const defaultConfig: BestingConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BestingConfig = await loadConfig({
  name: 'besting',
  cwd: resolve(__dirname, '..'),
  defaultConfig,
})
