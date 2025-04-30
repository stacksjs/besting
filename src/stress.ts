/* eslint-disable no-console */
import { spawn } from 'bun'
import process from 'node:process'

// Types for stress test results
export interface StressTestResult {
  requests: {
    count: number
    duration: {
      min: number
      max: number
      med: number
      p90: number
      p95: number
    }
    rate: number
    failed: {
      count: number
      rate: number
    }
    ttfb: {
      duration: {
        min: number
        max: number
        med: number
        p90: number
        p95: number
      }
    }
    dnsLookup: {
      duration: {
        min: number
        max: number
        med: number
        p90: number
        p95: number
      }
    }
    tlsHandshaking: {
      duration: {
        min: number
        max: number
        med: number
        p90: number
        p95: number
      }
    }
    download: {
      duration: {
        min: number
        max: number
        med: number
        p90: number
        p95: number
      }
      data: {
        count: number
        rate: number
      }
    }
    upload: {
      duration: {
        min: number
        max: number
        med: number
        p90: number
        p95: number
      }
      data: {
        count: number
        rate: number
      }
    }
  }
  testRun: {
    concurrency: number
    duration: number
  }
}

/**
 * Standard HTTP methods
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * Interface describing the Stress Test Builder
 */
export interface StressTestBuilder {
  // Core methods
  for: (seconds: number) => StressTestBuilder
  seconds: () => StressTestBuilder
  concurrently: (requests: number) => StressTestBuilder

  // HTTP methods
  get: () => Promise<StressTestResult>
  post: (payload?: Record<string, any>) => Promise<StressTestResult>
  put: (payload?: Record<string, any>) => Promise<StressTestResult>
  delete: () => Promise<StressTestResult>
  patch: (payload?: Record<string, any>) => Promise<StressTestResult>
  head: () => Promise<StressTestResult>
  options: (payload?: Record<string, any>) => Promise<StressTestResult>

  // Headers
  headers: (headers: Record<string, string>) => StressTestBuilder

  // Debug methods
  dd: () => Promise<StressTestResult>
  dump: () => Promise<StressTestResult>
  verbosely: () => Promise<StressTestResult>
}

/**
 * Options for stress test
 */
interface StressTestOptions {
  duration: number
  concurrency: number
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  payload?: Record<string, any>
  verbose?: boolean
}

/**
 * Implementation of Stress test builder
 */
class StressTest implements StressTestBuilder {
  private testOptions: StressTestOptions

  constructor(url: string) {
    this.testOptions = {
      duration: 10, // default is 10 seconds
      concurrency: 1, // default is 1 concurrent request
      method: 'GET', // default method is GET
      url,
    }
  }

  /**
   * Set the duration of the stress test
   */
  for(seconds: number): StressTestBuilder {
    this.testOptions.duration = seconds
    return this
  }

  /**
   * Syntactic sugar for ending the for() chain
   */
  seconds(): StressTestBuilder {
    return this
  }

  /**
   * Set the number of concurrent requests
   */
  concurrently(requests: number): StressTestBuilder {
    this.testOptions.concurrency = requests
    return this
  }

  /**
   * Set HTTP headers for the requests
   */
  headers(headers: Record<string, string>): StressTestBuilder {
    this.testOptions.headers = headers
    return this
  }

  /**
   * Debug - Dump and die
   */
  async dd(): Promise<StressTestResult> {
    this.testOptions.verbose = true
    const result = await this.runTest()
    console.log(JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Debug - Dump
   */
  async dump(): Promise<StressTestResult> {
    this.testOptions.verbose = true
    const result = await this.runTest()
    console.log(JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Debug - Verbose output
   */
  async verbosely(): Promise<StressTestResult> {
    this.testOptions.verbose = true
    return this.runTest()
  }

  /**
   * GET request
   */
  async get(): Promise<StressTestResult> {
    this.testOptions.method = 'GET'
    return this.runTest()
  }

  /**
   * POST request
   */
  async post(payload?: Record<string, any>): Promise<StressTestResult> {
    this.testOptions.method = 'POST'
    this.testOptions.payload = payload
    return this.runTest()
  }

  /**
   * PUT request
   */
  async put(payload?: Record<string, any>): Promise<StressTestResult> {
    this.testOptions.method = 'PUT'
    this.testOptions.payload = payload
    return this.runTest()
  }

  /**
   * DELETE request
   */
  async delete(): Promise<StressTestResult> {
    this.testOptions.method = 'DELETE'
    return this.runTest()
  }

  /**
   * PATCH request
   */
  async patch(payload?: Record<string, any>): Promise<StressTestResult> {
    this.testOptions.method = 'PATCH'
    this.testOptions.payload = payload
    return this.runTest()
  }

  /**
   * HEAD request
   */
  async head(): Promise<StressTestResult> {
    this.testOptions.method = 'HEAD'
    return this.runTest()
  }

  /**
   * OPTIONS request
   */
  async options(payload?: Record<string, any>): Promise<StressTestResult> {
    this.testOptions.method = 'OPTIONS'
    this.testOptions.payload = payload
    return this.runTest()
  }

  /**
   * Run the stress test using Bun's performance APIs
   * If bombardier is available, it will be used for more advanced metrics
   */
  private async runTest(): Promise<StressTestResult> {
    // First check if bombardier is installed (preferred tool)
    const hasBombardier = await this.checkForTool('bombardier')

    if (hasBombardier) {
      return this.runWithBombardier()
    }

    // Fallback to Bun's built-in HTTP client
    return this.runWithBunFetch()
  }

  /**
   * Check if an external tool is available
   */
  private async checkForTool(command: string): Promise<boolean> {
    try {
      const proc = spawn(['which', command])
      const exitCode = await proc.exited
      return exitCode === 0
    }
    catch {
      return false
    }
  }

  /**
   * Run stress test using bombardier
   */
  private async runWithBombardier(): Promise<StressTestResult> {
    const { url, method, duration, concurrency, headers, payload, verbose } = this.testOptions

    // Prepare command arguments for bombardier
    const args = [
      '-c',
      concurrency.toString(),
      '-d',
      `${duration}s`,
      '-m',
      method,
      '--format',
      'json',
    ]

    // Add headers if specified
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        args.push('-H', `${key}: ${value}`)
      }
    }

    // Add body if necessary for certain methods
    if (payload && ['POST', 'PUT', 'PATCH', 'OPTIONS'].includes(method)) {
      // Create temporary file for payload
      const payloadStr = JSON.stringify(payload)
      const tmpFilename = `/tmp/besting-payload-${Date.now()}.json`
      const tmpFile = Bun.file(tmpFilename)
      await Bun.write(tmpFile, payloadStr)

      args.push('-f', tmpFilename)
      args.push('-H', 'Content-Type: application/json')
    }

    // Add URL
    args.push(url)

    if (verbose) {
      console.log('Running stress test with bombardier:', 'bombardier', ...args)
    }

    // Run bombardier
    const proc = spawn(['bombardier', ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
    })

    // Get output
    const output = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      throw new Error(`Bombardier failed: ${stderr}`)
    }

    let bombardierResult
    try {
      bombardierResult = JSON.parse(output)
    }
    catch {
      throw new Error(`Failed to parse bombardier output: ${output}`)
    }

    // Convert bombardier results to our StressTestResult format
    return this.processRawBombardierResults(bombardierResult)
  }

  /**
   * Process raw results from bombardier
   */
  private processRawBombardierResults(raw: any): StressTestResult {
    // Example implementation - adapt to actual bombardier JSON output
    return {
      requests: {
        count: raw.numRequests || 0,
        duration: {
          min: raw.latencies?.min / 1000000 || 0, // Convert from ns to ms
          max: raw.latencies?.max / 1000000 || 0,
          med: raw.latencies?.mean / 1000000 || 0,
          p90: raw.latencies?.p90 / 1000000 || 0,
          p95: raw.latencies?.p95 / 1000000 || 0,
        },
        rate: raw.rps?.mean || 0,
        failed: {
          count: raw.errors || 0,
          rate: (raw.errors / raw.numRequests) * raw.rps?.mean || 0,
        },
        ttfb: {
          duration: {
            min: 0, // Bombardier doesn't provide these metrics
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        dnsLookup: {
          duration: {
            min: 0,
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        tlsHandshaking: {
          duration: {
            min: 0,
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        download: {
          duration: {
            min: 0,
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
          data: {
            count: raw.bytesRead || 0,
            rate: raw.bytesRead / this.testOptions.duration || 0,
          },
        },
        upload: {
          duration: {
            min: 0,
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
          data: {
            count: raw.bytesWritten || 0,
            rate: raw.bytesWritten / this.testOptions.duration || 0,
          },
        },
      },
      testRun: {
        concurrency: this.testOptions.concurrency,
        duration: this.testOptions.duration,
      },
    }
  }

  /**
   * Run stress test using Bun's fetch API
   */
  private async runWithBunFetch(): Promise<StressTestResult> {
    const { url, method, duration, concurrency, headers, payload, verbose } = this.testOptions

    if (verbose) {
      console.log(`Running stress test with Bun's fetch API:`, {
        url,
        method,
        duration,
        concurrency,
        headers,
        payload: payload ? '(payload provided)' : '(no payload)',
      })
    }

    const startTime = performance.now()
    const endTime = startTime + (duration * 1000)

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: headers as Record<string, string>,
    }

    if (payload && ['POST', 'PUT', 'PATCH', 'OPTIONS'].includes(method)) {
      requestOptions.body = JSON.stringify(payload)
    }

    const durations: number[] = []
    let successCount = 0
    let failedCount = 0
    let bytesRead = 0
    let bytesWritten = 0

    // Run requests concurrently
    const runBatch = async () => {
      const promises: Promise<void>[] = []

      for (let i = 0; i < concurrency; i++) {
        promises.push((async () => {
          while (performance.now() < endTime) {
            try {
              const requestStart = performance.now()

              // Calculate approximate bytes written (payload size)
              if (requestOptions.body) {
                bytesWritten += (requestOptions.body as string).length
              }

              const response = await fetch(url, requestOptions)
              const responseText = await response.text()

              // Calculate bytes read (response size)
              bytesRead += responseText.length

              const requestEnd = performance.now()
              const requestDuration = requestEnd - requestStart

              durations.push(requestDuration)

              if (response.ok) {
                successCount++
              }
              else {
                failedCount++
              }

              // Slight delay to prevent overwhelming the target
              await Bun.sleep(1)
            }
            catch (error) {
              failedCount++
            }
          }
        })())
      }

      await Promise.all(promises)
    }

    await runBatch()

    // Calculate statistics
    const totalRequests = successCount + failedCount
    const actualDuration = (performance.now() - startTime) / 1000 // in seconds

    // Sort durations for percentiles
    durations.sort((a, b) => a - b)

    const result: StressTestResult = {
      requests: {
        count: totalRequests,
        duration: {
          min: durations.length > 0 ? durations[0] : 0,
          max: durations.length > 0 ? durations[durations.length - 1] : 0,
          med: this.calculateMedian(durations),
          p90: this.calculatePercentile(durations, 90),
          p95: this.calculatePercentile(durations, 95),
        },
        rate: totalRequests / actualDuration,
        failed: {
          count: failedCount,
          rate: failedCount / actualDuration,
        },
        ttfb: {
          duration: {
            min: 0, // Not available with basic fetch
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        dnsLookup: {
          duration: {
            min: 0, // Not available with basic fetch
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        tlsHandshaking: {
          duration: {
            min: 0, // Not available with basic fetch
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
        },
        download: {
          duration: {
            min: 0, // Not available with basic fetch
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
          data: {
            count: bytesRead,
            rate: bytesRead / actualDuration,
          },
        },
        upload: {
          duration: {
            min: 0, // Not available with basic fetch
            max: 0,
            med: 0,
            p90: 0,
            p95: 0,
          },
          data: {
            count: bytesWritten,
            rate: bytesWritten / actualDuration,
          },
        },
      },
      testRun: {
        concurrency,
        duration,
      },
    }

    if (verbose) {
      console.log('Stress test results:', JSON.stringify(result, null, 2))
    }

    return result
  }

  /**
   * Calculate median value from an array of numbers
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0)
      return 0

    const mid = Math.floor(values.length / 2)

    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2
    }
    else {
      return values[mid]
    }
  }

  /**
   * Calculate percentile value from an array of numbers
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0)
      return 0

    const index = Math.ceil((percentile / 100) * values.length) - 1
    return values[Math.max(0, Math.min(values.length - 1, index))]
  }
}

/**
 * Create a new stress test for a URL
 */
export function stress(url: string): StressTestBuilder {
  return new StressTest(url)
}

// Command line interface for stress testing
export async function runStressCommand(args: string[]): Promise<void> {
  let url = ''
  let duration = 5 // Default duration: 5 seconds
  let concurrency = 1 // Default concurrency: 1 request
  let method: HttpMethod = 'GET'
  let payload: Record<string, any> | undefined

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      // Handle flags
      const flag = arg.slice(2)

      if (flag === 'duration' && i + 1 < args.length) {
        duration = Number.parseInt(args[++i], 10)
      }
      else if (flag === 'concurrency' && i + 1 < args.length) {
        concurrency = Number.parseInt(args[++i], 10)
      }
      else if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(flag)) {
        method = flag.toUpperCase() as HttpMethod

        // Check for payload with POST, PUT, PATCH, OPTIONS
        if (['post', 'put', 'patch', 'options'].includes(flag) && i + 1 < args.length && !args[i + 1].startsWith('--')) {
          try {
            payload = JSON.parse(args[++i])
          }
          catch {
            console.error(`Error parsing payload: ${args[i]}`)
            process.exit(1)
          }
        }
      }
      else {
        console.log(`Unknown option: ${flag}`)
      }
    }
    else if (!url) {
      // The first non-flag argument is the URL
      url = arg
    }
  }

  if (!url) {
    console.error('URL is required')
    console.log('Usage: bun stress <url> [options]')
    console.log('Options:')
    console.log('  --duration=<seconds>     Duration of the stress test in seconds (default: 5)')
    console.log('  --concurrency=<number>   Number of concurrent requests (default: 1)')
    console.log('  --get                    Use GET method (default)')
    console.log('  --post [payload]         Use POST method with optional JSON payload')
    console.log('  --put [payload]          Use PUT method with optional JSON payload')
    console.log('  --patch [payload]        Use PATCH method with optional JSON payload')
    console.log('  --delete                 Use DELETE method')
    console.log('  --head                   Use HEAD method')
    console.log('  --options [payload]      Use OPTIONS method with optional JSON payload')
    process.exit(1)
  }

  console.log(`Running stress test against ${url}`)
  console.log(`Duration: ${duration} seconds, Concurrency: ${concurrency}, Method: ${method}`)

  if (payload) {
    console.log(`Payload: ${JSON.stringify(payload)}`)
  }

  // Run the stress test
  const stressTest = stress(url)
    .for(duration)
    .seconds()
    .concurrently(concurrency)

  let result: StressTestResult

  switch (method) {
    case 'GET':
      result = await stressTest.get()
      break
    case 'POST':
      result = await stressTest.post(payload)
      break
    case 'PUT':
      result = await stressTest.put(payload)
      break
    case 'DELETE':
      result = await stressTest.delete()
      break
    case 'PATCH':
      result = await stressTest.patch(payload)
      break
    case 'HEAD':
      result = await stressTest.head()
      break
    case 'OPTIONS':
      result = await stressTest.options(payload)
      break
    default:
      result = await stressTest.get()
  }

  // Print summary
  console.log('\nStress Test Results:')
  console.log('===================')
  console.log(`Total Requests: ${result.requests.count}`)
  console.log(`Request Rate: ${result.requests.rate.toFixed(2)} req/sec`)
  console.log(`Failed Requests: ${result.requests.failed.count} (${(result.requests.failed.count / result.requests.count * 100).toFixed(2)}%)`)
  console.log('\nLatency:')
  console.log(`  Median: ${result.requests.duration.med.toFixed(2)} ms`)
  console.log(`  90th percentile: ${result.requests.duration.p90.toFixed(2)} ms`)
  console.log(`  95th percentile: ${result.requests.duration.p95.toFixed(2)} ms`)
  console.log(`  Min: ${result.requests.duration.min.toFixed(2)} ms`)
  console.log(`  Max: ${result.requests.duration.max.toFixed(2)} ms`)

  if (result.requests.download.data.count > 0) {
    console.log('\nTransfer:')
    console.log(`  Total Data Received: ${formatBytes(result.requests.download.data.count)}`)
    console.log(`  Data Rate: ${formatBytes(result.requests.download.data.rate)}/sec`)
  }

  if (result.requests.upload.data.count > 0) {
    console.log(`  Total Data Sent: ${formatBytes(result.requests.upload.data.count)}`)
    console.log(`  Upload Rate: ${formatBytes(result.requests.upload.data.rate)}/sec`)
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}
