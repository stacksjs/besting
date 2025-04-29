import type { BestingConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: BestingConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BestingConfig = await loadConfig({
  defaultConfig,
})
