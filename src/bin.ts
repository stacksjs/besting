#!/usr/bin/env bun

/* eslint-disable no-console */

/**
 * Custom test runner that runs each test file individually using Bun's test runner
 * with formatting that exactly matches Bun's built-in test output
 */

import { spawn } from 'bun'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

// ANSI color codes for pretty formatting
const colors = {
  reset: '\x1B[0m',
  green: '\x1B[32m',
  red: '\x1B[31m',
  dim: '\x1B[2m',
  cyan: '\x1B[36m',
  yellow: '\x1B[33m',
}

// Find all test files in a directory
function findTestFiles(dir: string, filePattern = /\.(test|spec)\.(ts|js|tsx|jsx)$/): string[] {
  if (!existsSync(dir)) {
    return []
  }

  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath, filePattern))
    }
    else if (filePattern.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

async function runTests() {
  const args = process.argv.slice(2)
  const filterPaths = args.length > 0 ? args : []

  // First, gather all test files
  const rootDir = process.cwd()
  const testDirs = ['test', 'examples'].filter(dir => existsSync(resolve(rootDir, dir)))

  let allTestFiles: string[] = []
  for (const dir of testDirs) {
    allTestFiles = [...allTestFiles, ...findTestFiles(resolve(rootDir, dir))]
  }

  // Apply filter if provided
  if (filterPaths.length > 0) {
    allTestFiles = allTestFiles.filter((file) => {
      const relativePath = file.replace(rootDir, '').replace(/^\//, '')
      return filterPaths.some(filter => relativePath.includes(filter))
    })
  }

  // Get Bun revision in short form for display
  const revision = Bun.revision?.substring(0, 8) || ''
  console.log(`bun test v${Bun.version}${revision ? ` (${revision})` : ''}${colors.reset}\n`)

  let totalPassed = 0
  let totalFailed = 0
  let totalSkipped = 0
  let totalExpectCalls = 0
  let totalTestsRun = 0

  // Run each test file individually
  for (const testFile of allTestFiles) {
    const relativePath = testFile.replace(rootDir, '').replace(/^\//, '')

    // Print file name
    console.log(`${relativePath}:`)

    // Run the test file using Bun's test runner
    const proc = spawn({
      cmd: ['bun', 'test', testFile],
      env: { ...process.env },
      stdout: 'pipe',
      stderr: 'pipe',
    })

    // Get the output
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    // Extract timestamp if available
    let timestamp = ''
    const timeMatch = stdout.match(/(\d+:\d+:\d+\s+[AP]M)/)
    if (timeMatch) {
      timestamp = timeMatch[1]
    }

    // Extract the configuration line from stdout
    const configLine = stdout.match(/Failed to load client config[^\n]+/)
    const bunfigLine = stdout.match(/\[bunfig\] Configuration found[^\n]+/)

    if (configLine) {
      console.log(configLine[0])
    }

    if (bunfigLine) {
      // Calculate the space needed for right alignment
      const spaceCount = Math.max(1, 76 - bunfigLine[0].length - timestamp.length)
      console.log(`${bunfigLine[0]}${' '.repeat(spaceCount)}${timestamp}`)
    }

    // Process test results
    const outputLines = stdout.split('\n')

    // Track test stats
    let passed = 0
    let failed = 0
    let skipped = 0
    let expectCalls = 0

    // Process each line to extract test results and format them
    for (const line of outputLines) {
      // Process test results - extract real information from the line
      if (line.match(/^✓\s+(.*?)(?=\s+\[|\s*$)/)) {
        // Found a passing test in Bun's original format, copy it directly
        console.log(line)
      }
      else if (line.match(/^✗\s+(.*?)(?=\s+\[|\s*$)/)) {
        // Found a failing test in Bun's original format, copy it directly
        console.log(line)
      }
      else if (line.match(/^»\s+(.*?)(?=\s+\[|\s*$)/)) {
        // Found a skipped test in Bun's original format, copy it directly
        console.log(line)
      }
      // Handle (pass) lines (needed if Bun changes format)
      else if (line.includes('(pass)') && !line.includes('bun test')) {
        const content = line.replace(/\(pass\)\s+/, '')
        const parts = content.split(' > ')

        if (parts.length === 2) {
          const suite = parts[0]
          const testDetails = parts[1]
          console.log(`${colors.green}✓${colors.reset} ${suite} ${colors.dim}>${colors.reset} ${testDetails}`)
        }
        else {
          console.log(`${colors.green}✓${colors.reset} ${content}`)
        }
      }
      // Handle (fail) lines (needed if Bun changes format)
      else if (line.includes('(fail)') && !line.includes('bun test')) {
        const content = line.replace(/\(fail\)\s+/, '')
        const parts = content.split(' > ')

        if (parts.length === 2) {
          const suite = parts[0]
          const testDetails = parts[1]
          console.log(`${colors.red}✗${colors.reset} ${suite} ${colors.dim}>${colors.reset} ${testDetails}`)
        }
        else {
          console.log(`${colors.red}✗${colors.reset} ${content}`)
        }
      }
      // Handle (skip) lines (needed if Bun changes format)
      else if (line.includes('(skip)') && !line.includes('bun test')) {
        const content = line.replace(/\(skip\)\s+/, '')
        const parts = content.split(' > ')

        if (parts.length === 2) {
          const suite = parts[0]
          const testDetails = parts[1]
          console.log(`${colors.yellow}»${colors.reset} ${suite} ${colors.dim}>${colors.reset} ${testDetails}`)
        }
        else {
          console.log(`${colors.yellow}»${colors.reset} ${content}`)
        }
      }
      // Handle error lines
      else if (line.includes('error:')) {
        console.log(`${colors.red}${line}${colors.reset}`)
      }
      // Extract summary statistics
      else if (line.match(/^\s*(\d+) pass\s*$/)) {
        const count = Number.parseInt(line.match(/(\d+) pass/)?.[1] || '0')
        passed = count
        totalPassed += count
      }
      else if (line.match(/^\s*(\d+) fail\s*$/)) {
        const count = Number.parseInt(line.match(/(\d+) fail/)?.[1] || '0')
        failed = count
        totalFailed += count
      }
      else if (line.match(/^\s*(\d+) skip\s*$/)) {
        const count = Number.parseInt(line.match(/(\d+) skip/)?.[1] || '0')
        skipped = count
        totalSkipped += count
      }
      else if (line.match(/^\s*(\d+) expect\(\) calls\s*$/)) {
        const count = Number.parseInt(line.match(/(\d+) expect/)?.[1] || '0')
        expectCalls = count
        totalExpectCalls += count
      }
    }

    // Calculate total tests for this file
    const testsRun = passed + failed + skipped
    totalTestsRun += testsRun

    // Print stderr if any
    if (stderr.trim()) {
      console.error(stderr)
    }

    // Print summary for this file
    console.log()
    if (passed > 0)
      console.log(`${colors.green} ${passed} pass${colors.reset}`)
    if (failed > 0)
      console.log(`${colors.red} ${failed} fail${colors.reset}`)
    if (skipped > 0)
      console.log(`${colors.yellow} ${skipped} skip${colors.reset}`)
    console.log(` ${expectCalls} expect() calls`)
    console.log(`Ran ${testsRun} tests across 1 files.`)
    console.log()
  }

  if (allTestFiles.length > 1) {
    // Print final summary for multiple files
    if (totalPassed > 0)
      console.log(`${colors.green} ${totalPassed} pass${colors.reset}`)
    if (totalFailed > 0)
      console.log(`${colors.red} ${totalFailed} fail${colors.reset}`)
    if (totalSkipped > 0)
      console.log(`${colors.yellow} ${totalSkipped} skip${colors.reset}`)
    console.log(` ${totalExpectCalls} expect() calls`)
    console.log(`Ran ${totalTestsRun} tests across ${allTestFiles.length} files.`)
  }
}

runTests().catch((error) => {
  console.error('Test runner failed:', error)
  process.exit(1)
})
