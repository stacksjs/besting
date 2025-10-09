import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'
import type { BrowserType } from '../src/browser-setup'
import { isBrowserInstalled, removeBrowser, setupBrowser, setupFirefox } from '../src/browser-setup'

const cli = new CAC('besting')

interface CliOption {
  verbose: boolean
}

cli
  .command('test', 'Run the tests')
  .option('--verbose', 'Enable verbose logging')
  .example('besting test --verbose')
  .action(async (options?: CliOption) => {
    console.log('Options:', options)
  })

cli
  .command('setup-browser', 'Download and install Chromium or Firefox for browser testing')
  .option('--browser <type>', 'Browser type: chromium or firefox (default: chromium)')
  .option('--force', 'Force reinstallation even if already installed')
  .example('besting setup-browser')
  .example('besting setup-browser --browser firefox')
  .action(async (options?: { force?: boolean, browser?: string }) => {
    try {
      const browserType: BrowserType = (options?.browser === 'firefox' ? 'firefox' : 'chromium')
      const browserName = browserType === 'firefox' ? 'Firefox' : 'Chromium'

      // Check if already installed
      if (!options?.force && isBrowserInstalled(browserType)) {
        console.log(`✓ ${browserName} is already installed!`)
        console.log('  Use --force to reinstall')
        return
      }

      // Remove existing installation if force
      if (options?.force && isBrowserInstalled(browserType)) {
        console.log(`Removing existing ${browserName} installation...`)
        await removeBrowser(browserType)
      }

      // Install browser
      console.log(`Setting up ${browserName} for browser testing...`)
      console.log('This may take a few minutes depending on your connection.\n')

      if (browserType === 'firefox') {
        await setupFirefox((message) => {
          console.log(message)
        })
      }
      else {
        await setupBrowser((message) => {
          console.log(message)
        })
      }

      console.log(`\n✓ ${browserName} setup complete!`)
      console.log('  You can now use browser testing in your tests.')
    }
    catch (error) {
      console.error('✗ Failed to setup browser:', error)
      process.exit(1)
    }
  })

cli
  .command('remove-browser', 'Remove installed browser')
  .option('--browser <type>', 'Browser type: chromium or firefox (default: chromium)')
  .example('besting remove-browser')
  .example('besting remove-browser --browser firefox')
  .action(async (options?: { browser?: string }) => {
    try {
      const browserType: BrowserType = (options?.browser === 'firefox' ? 'firefox' : 'chromium')
      const browserName = browserType === 'firefox' ? 'Firefox' : 'Chromium'

      if (!isBrowserInstalled(browserType)) {
        console.log(`No ${browserName} installation found.`)
        return
      }

      console.log(`Removing ${browserName}...`)
      await removeBrowser(browserType)
      console.log(`✓ ${browserName} removed successfully!`)
    }
    catch (error) {
      console.error('✗ Failed to remove browser:', error)
      process.exit(1)
    }
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
