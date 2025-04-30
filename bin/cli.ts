import { CAC } from 'cac'
import { version } from '../package.json'

const cli = new CAC('besting')

interface CliOption {
  verbose: boolean
}

cli
  .command('abc', 'some command')
  .option('--verbose', 'Enable verbose logging')
  .example('besting abc --verbose')
  .action(async (options?: CliOption) => {
    console.log('Options:', options)
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
