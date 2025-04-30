import { artisan, command, describe, expect, test } from 'besting'

describe('Command Testing', () => {
  test('can execute a command and assert on its output', async () => {
    // Execute a simple echo command
    const cmd = command()
    const result = await cmd.execute('echo', ['Hello, World!'])

    // Assert on the result
    expect(result.exitCode).toBe(0)
    expect(result.output).toContain('Hello, World!')
    expect(result.errorOutput).toBe('')
  })

  test('can use assertion methods', async () => {
    // Execute a command
    const cmd = command()
    await cmd.execute('echo', ['Testing command output'])

    // Chain assertions
    cmd
      .assertExitCode(0)
      .assertOutputContains('Testing')
      .assertOutputNotContains('error')

    // Get the result for additional assertions
    const result = cmd.getResult()
    expect(result.output.trim()).toBe('Testing command output')
  })

  test('can detect command errors', async () => {
    // Execute a command that should fail
    // We're using 'cat' on a non-existent file which should fail
    const cmd = command()
    const result = await cmd.execute('cat', ['non-existent-file'])

    // Assert that the command failed
    expect(result.exitCode).not.toBe(0)

    // Using assertion methods
    cmd.assertOutputNotContains('Success')
  })

  test('can execute complex commands', async () => {
    // Execute a command with pipes
    const cmd = command()
    await cmd.execute('sh', ['-c', 'echo "Line 1" && echo "Line 2" && echo "Line 3"'])

    // Assert on multiple lines
    cmd
      .assertExitCode(0)
      .assertOutputContains('Line 1')
      .assertOutputContains('Line 2')
      .assertOutputContains('Line 3')
  })

  // Artisan command test - This would only run in a Laravel environment
  // Here we're just testing the function signature, not actually executing it
  test.skip('can run artisan commands', async () => {
    // This is just a demonstration of how it would look
    // In a real Laravel project, this would actually run the command
    const result = await artisan('migrate', ['--seed'])

    // Assertions would look like this
    expect(result.exitCode).toBe(0)
    expect(result.output).toContain('Migration')

    // Or using the command helper directly
    const cmd = command()
    await cmd.execute('php', ['artisan', 'make:model', 'User', '--migration'])

    cmd
      .assertExitCode(0)
      .assertOutputContains('Model created successfully')
      .assertOutputContains('Migration created successfully')
  })
})
