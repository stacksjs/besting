import { CAC } from 'cac'
import { version } from '../package.json'

const cli = new CAC('besting')

interface CliOption {
  from: string
  verbose: boolean
}

cli
  .command('start', 'some command')
  .option('--verbose', 'Enable verbose logging')
  .example('besting start --from localhost:5173 --to my-project.localhost')
  .action(async (options?: CliOption) => {
    if (!options?.from) {
      console.error('Missing --from option')
    }
    else {
      console.log('Options:', options)
    }
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
