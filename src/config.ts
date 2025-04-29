import type { BestingConfig } from './types'

/**
 * Simple configuration loader for Besting
 */
export function loadConfig(userConfig?: Partial<BestingConfig>): BestingConfig {
  return {
    ...defaultConfig,
    ...userConfig,
  };
}

export const defaultConfig: BestingConfig = {
  verbose: true,
}

export const config: BestingConfig = loadConfig();
