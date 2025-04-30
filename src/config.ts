import type { BestingConfig } from './types'
import { resolve } from 'node:path'
import { loadConfig as loadBunfigConfig } from 'bunfig'

/**
 * Default configuration for the router
 */
export const defaultConfig: BestingConfig = {
  verbose: true,
}

/**
 * Load configuration from bunfig
 */
export function loadConfig(config: Partial<BestingConfig> = {}): BestingConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BestingConfig = await loadBunfigConfig({
  name: 'besting',
  cwd: resolve(__dirname, '..'),
  defaultConfig,
})
