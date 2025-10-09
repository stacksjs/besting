import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'

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

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
