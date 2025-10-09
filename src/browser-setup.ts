/**
 * Browser Setup Utilities
 *
 * Downloads and installs Chromium and Firefox for browser testing
 */

import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export type BrowserType = 'chromium' | 'firefox'

interface ChromiumRevision {
  revision: string
  platform: string
  downloadUrl: string
}

interface FirefoxRevision {
  version: string
  platform: string
  downloadUrl: string
}

/**
 * Get the latest Chromium revision for the current platform
 */
function getChromiumRevision(): ChromiumRevision {
  const platform = process.platform
  const arch = process.arch

  // These are stable Chromium revisions known to work well
  // You can update these to newer versions as needed
  const baseUrl = 'https://storage.googleapis.com/chromium-browser-snapshots'

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      return {
        revision: '1160321',
        platform: 'Mac_Arm',
        downloadUrl: `${baseUrl}/Mac_Arm/1160321/chrome-mac.zip`,
      }
    }
    return {
      revision: '1160321',
      platform: 'Mac',
      downloadUrl: `${baseUrl}/Mac/1160321/chrome-mac.zip`,
    }
  }
  else if (platform === 'linux') {
    return {
      revision: '1160321',
      platform: 'Linux_x64',
      downloadUrl: `${baseUrl}/Linux_x64/1160321/chrome-linux.zip`,
    }
  }
  else if (platform === 'win32') {
    return {
      revision: '1160321',
      platform: 'Win_x64',
      downloadUrl: `${baseUrl}/Win_x64/1160321/chrome-win.zip`,
    }
  }

  throw new Error(`Unsupported platform: ${platform}`)
}

/**
 * Get Firefox revision for the current platform
 */
function getFirefoxRevision(): FirefoxRevision {
  const platform = process.platform
  const baseUrl = 'https://ftp.mozilla.org/pub/firefox/releases'
  const version = '131.0' // Latest stable version

  if (platform === 'darwin') {
    return {
      version,
      platform: 'mac',
      downloadUrl: `${baseUrl}/${version}/mac/en-US/Firefox%20${version}.dmg`,
    }
  }
  else if (platform === 'linux') {
    return {
      version,
      platform: 'linux',
      downloadUrl: `${baseUrl}/${version}/linux-x86_64/en-US/firefox-${version}.tar.bz2`,
    }
  }
  else if (platform === 'win32') {
    return {
      version,
      platform: 'win64',
      downloadUrl: `${baseUrl}/${version}/win64/en-US/Firefox%20Setup%20${version}.exe`,
    }
  }

  throw new Error(`Unsupported platform: ${platform}`)
}

/**
 * Get the installation directory
 */
export function getInstallDir(browser: BrowserType = 'chromium'): string {
  const homeDir = os.homedir()
  const bestingDir = path.join(homeDir, '.besting')
  return bestingDir
}

/**
 * Get bundled Firefox path
 */
export function getBundledFirefoxPath(): string {
  const homeDir = os.homedir()
  const bestingDir = path.join(homeDir, '.besting')
  const platform = process.platform

  if (platform === 'darwin') {
    return path.join(bestingDir, 'firefox-mac', 'Firefox.app', 'Contents', 'MacOS', 'firefox')
  }
  else if (platform === 'linux') {
    return path.join(bestingDir, 'firefox-linux', 'firefox', 'firefox')
  }
  else if (platform === 'win32') {
    return path.join(bestingDir, 'firefox-win64', 'firefox.exe')
  }

  return ''
}

/**
 * Find Firefox executable
 */
export function findFirefox(): string | null {
  // Check for bundled Firefox first
  const bundledPath = getBundledFirefoxPath()
  if (fs.existsSync(bundledPath)) {
    return bundledPath
  }

  // Common Firefox installation paths
  const firefoxPaths = [
    // macOS
    '/Applications/Firefox.app/Contents/MacOS/firefox',
    // Linux
    '/usr/bin/firefox',
    '/usr/local/bin/firefox',
    '/opt/firefox/firefox',
    '/snap/bin/firefox',
    // Windows
    'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
  ]

  for (const firefoxPath of firefoxPaths) {
    if (fs.existsSync(firefoxPath)) {
      return firefoxPath
    }
  }

  return null
}

/**
 * Check if Chromium is already installed
 */
export function isChromiumInstalled(): boolean {
  const installDir = getInstallDir('chromium')
  const platform = process.platform
  const arch = process.arch

  let chromiumPath = ''

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      chromiumPath = path.join(installDir, 'chromium-mac-arm64', 'chrome-mac', 'Chromium.app')
    }
    else {
      chromiumPath = path.join(installDir, 'chromium-mac-x64', 'chrome-mac', 'Chromium.app')
    }
  }
  else if (platform === 'linux') {
    chromiumPath = path.join(installDir, 'chromium-linux', 'chrome-linux', 'chrome')
  }
  else if (platform === 'win32') {
    chromiumPath = path.join(installDir, 'chromium-win64', 'chrome-win', 'chrome.exe')
  }

  return fs.existsSync(chromiumPath)
}

/**
 * Check if Firefox is already installed
 */
export function isFirefoxInstalled(): boolean {
  const bundledPath = getBundledFirefoxPath()
  return fs.existsSync(bundledPath)
}

/**
 * Check if a browser is installed
 */
export function isBrowserInstalled(browser: BrowserType): boolean {
  return browser === 'firefox' ? isFirefoxInstalled() : isChromiumInstalled()
}

/**
 * Download file with progress
 */
async function downloadFile(url: string, destPath: string, onProgress?: (percent: number) => void): Promise<void> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  const totalSize = Number.parseInt(response.headers.get('content-length') || '0', 10)
  let downloadedSize = 0

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Failed to get response reader')
  }

  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()

    if (done)
      break

    chunks.push(value)
    downloadedSize += value.length

    if (onProgress && totalSize > 0) {
      const percent = Math.round((downloadedSize / totalSize) * 100)
      onProgress(percent)
    }
  }

  // Combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  // Write to file
  await Bun.write(destPath, result)
}

/**
 * Extract zip file
 */
async function extractZip(zipPath: string, destDir: string): Promise<void> {
  const platform = process.platform

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  if (platform === 'win32') {
    // Use PowerShell on Windows
    await execAsync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`)
  }
  else {
    // Use unzip on Unix-like systems
    await execAsync(`unzip -q -o "${zipPath}" -d "${destDir}"`)
  }
}

/**
 * Download and install Chromium
 */
export async function setupBrowser(onProgress?: (message: string) => void): Promise<void> {
  const revision = getChromiumRevision()
  const installDir = getInstallDir()
  const platform = process.platform
  const arch = process.arch

  // Create install directory
  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true })
  }

  onProgress?.('Downloading Chromium...')

  // Download Chromium
  const zipPath = path.join(installDir, 'chromium.zip')

  await downloadFile(revision.downloadUrl, zipPath, (percent) => {
    onProgress?.(`Downloading Chromium: ${percent}%`)
  })

  onProgress?.('Extracting Chromium...')

  // Determine extraction directory
  let extractDir = installDir
  if (platform === 'darwin') {
    extractDir = path.join(installDir, arch === 'arm64' ? 'chromium-mac-arm64' : 'chromium-mac-x64')
  }
  else if (platform === 'linux') {
    extractDir = path.join(installDir, 'chromium-linux')
  }
  else if (platform === 'win32') {
    extractDir = path.join(installDir, 'chromium-win64')
  }

  // Extract
  await extractZip(zipPath, extractDir)

  // Clean up zip file
  fs.unlinkSync(zipPath)

  // Set executable permissions on Unix-like systems
  if (platform !== 'win32') {
    let chromiumBinary = ''

    if (platform === 'darwin') {
      chromiumBinary = path.join(
        extractDir,
        'chrome-mac',
        'Chromium.app',
        'Contents',
        'MacOS',
        'Chromium',
      )
    }
    else if (platform === 'linux') {
      chromiumBinary = path.join(extractDir, 'chrome-linux', 'chrome')
    }

    if (chromiumBinary && fs.existsSync(chromiumBinary)) {
      await execAsync(`chmod +x "${chromiumBinary}"`)
    }
  }

  onProgress?.('Chromium installed successfully!')
}

/**
 * Download and install Firefox
 */
export async function setupFirefox(onProgress?: (message: string) => void): Promise<void> {
  const revision = getFirefoxRevision()
  const installDir = getInstallDir('firefox')
  const platform = process.platform

  // Create install directory
  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true })
  }

  onProgress?.('Downloading Firefox...')

  const downloadPath = path.join(installDir, platform === 'darwin' ? 'firefox.dmg' : platform === 'win32' ? 'firefox-setup.exe' : 'firefox.tar.bz2')

  await downloadFile(revision.downloadUrl, downloadPath, (percent) => {
    onProgress?.(`Downloading Firefox: ${percent}%`)
  })

  onProgress?.('Installing Firefox...')

  const extractDir = path.join(installDir, `firefox-${platform}`)

  if (platform === 'darwin') {
    // Mount DMG and copy app
    const mountPoint = path.join(installDir, 'firefox-mount')
    fs.mkdirSync(mountPoint, { recursive: true })

    await execAsync(`hdiutil attach "${downloadPath}" -mountpoint "${mountPoint}"`)
    await execAsync(`cp -R "${mountPoint}/Firefox.app" "${extractDir}/"`)
    await execAsync(`hdiutil detach "${mountPoint}"`)
    fs.rmSync(mountPoint, { recursive: true, force: true })
  }
  else if (platform === 'linux') {
    // Extract tar.bz2
    await execAsync(`tar -xjf "${downloadPath}" -C "${extractDir}"`)
  }
  else if (platform === 'win32') {
    // On Windows, just keep the installer
    // Users will need to run it manually or we can execute it silently
    await execAsync(`"${downloadPath}" /S /InstallDirectoryPath="${extractDir}"`)
  }

  // Clean up download file
  if (fs.existsSync(downloadPath)) {
    fs.unlinkSync(downloadPath)
  }

  onProgress?.('Firefox installed successfully!')
}

/**
 * Remove installed browser
 */
export async function removeBrowser(browser?: BrowserType): Promise<void> {
  const installDir = getInstallDir(browser)

  if (fs.existsSync(installDir)) {
    fs.rmSync(installDir, { recursive: true, force: true })
  }
}
