import type { CommandResult, CommandTester } from './types'
import { expect } from './test'

/**
 * Command testing utilities for the Besting framework
 */

/**
 * CommandTester implementation
 */
class CommandTestCase implements CommandTester {
  private _result: CommandResult | null = null

  /**
   * Execute a command
   */
  async execute(command: string, args: string[] = []): Promise<CommandResult> {
    // Create a child process to run the command
    const process = Bun.spawn([command, ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
    })

    // Get the output
    const output = await new Response(process.stdout).text()
    const errorOutput = await new Response(process.stderr).text()

    // Store the result
    this._result = {
      exitCode: await process.exited,
      output,
      errorOutput,
    }

    return this._result
  }

  /**
   * Assert that the command exited with a specific code
   */
  assertExitCode(exitCode: number): CommandTester {
    if (!this._result) {
      throw new Error('No command has been executed')
    }

    expect(this._result.exitCode).toBe(exitCode)
    return this
  }

  /**
   * Assert that the output contains a specific string
   */
  assertOutputContains(text: string): CommandTester {
    if (!this._result) {
      throw new Error('No command has been executed')
    }

    expect(this._result.output).toContain(text)
    return this
  }

  /**
   * Assert that the output does not contain a specific string
   */
  assertOutputNotContains(text: string): CommandTester {
    if (!this._result) {
      throw new Error('No command has been executed')
    }

    expect(this._result.output).not.toContain(text)
    return this
  }

  /**
   * Get the command result
   */
  getResult(): CommandResult {
    if (!this._result) {
      throw new Error('No command has been executed')
    }

    return this._result
  }
}

/**
 * Create a new command tester
 */
export function command(): CommandTester {
  return new CommandTestCase()
}

/**
 * Run an artisan command
 */
export async function artisan(artisanCommand: string, args: string[] = []): Promise<CommandResult> {
  const cmd = command()
  return cmd.execute('php', ['artisan', artisanCommand, ...args])
}
