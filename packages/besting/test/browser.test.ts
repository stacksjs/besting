import { describe, expect, test } from 'bun:test'
import { browse } from '../src/virtual-page'

describe('Virtual DOM Browser Testing', () => {
  test('should navigate to a page', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')
      await page.assertTitle('Example Domain')
      await page.assertSee('Example Domain')
    })
  })

  test('should interact with elements', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Check element visibility
      const isVisible = await page.isVisible('h1')
      expect(isVisible).toBe(true)

      // Get element text
      const heading = await page.text('h1')
      expect(heading).toBe('Example Domain')
    })
  })

  test('should handle navigation', async () => {
    await browse(async (page) => {
      // Navigate to first page
      await page.goto('https://example.com')
      await page.assertUrlContains('example.com')

      // Get page title
      const title = await page.title()
      expect(title).toBe('Example Domain')

      // Get page URL
      const url = await page.url()
      expect(url).toContain('example.com')
    })
  })

  test('should execute JavaScript', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Execute JavaScript on the page
      const result = await page.evaluate(() => {
        return document.querySelectorAll('p').length
      })

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
    })
  })

  test('should handle selectors', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Wait for selector
      const element = await page.waitForSelector('h1')
      expect(element).not.toBeNull()

      // Query selector
      const heading = await page.querySelector('h1')
      expect(heading).not.toBeNull()

      // Query all selectors
      const paragraphs = await page.querySelectorAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  test('should use Laravel Dusk-style assertions', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Text assertions
      await page.assertSee('Example Domain')
      await page.assertDontSee('Not on page')

      // Element assertions
      await page.assertPresent('h1')
      await page.assertVisible('h1')
      await page.assertMissing('.non-existent')

      // Title assertions
      await page.assertTitle('Example Domain')
      await page.assertTitleContains('Example')

      // URL assertions
      await page.assertUrlContains('example.com')
    })
  })

  test('should handle keyboard input', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Press a key (no-op in virtual DOM)
      await page.press('Tab')
      await page.press('Enter')
    })
  })

  test('should set viewport size', async () => {
    await browse(async (page) => {
      // Set custom viewport (no-op in virtual DOM)
      await page.setViewport(1920, 1080)

      await page.goto('https://example.com')

      // Verify page loaded
      await page.assertPresent('body')
    })
  })

  test('should wait for text to appear', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Wait for specific text
      await page.waitForText('Example Domain', { timeout: 5000 })
    })
  })
})

describe('Storage APIs', () => {
  test('should manage local storage', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Set item
      await page.setLocalStorage('theme', 'dark')

      // Get item
      const theme = await page.getLocalStorage('theme')
      expect(theme).toBe('dark')

      // Remove item
      await page.removeLocalStorage('theme')

      // Clear all
      await page.clearLocalStorage()
    })
  })

  test('should manage session storage', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Set item
      await page.setSessionStorage('tab', 'home')

      // Get item
      const tab = await page.getSessionStorage('tab')
      expect(tab).toBe('home')

      // Remove item
      await page.removeSessionStorage('tab')

      // Clear all
      await page.clearSessionStorage()
    })
  })
})

describe('Cookie Management', () => {
  test('should manage cookies', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      // Set cookie
      await page.setCookie('test', 'value123')

      // Get all cookies
      const cookies = await page.getCookies()
      expect(cookies).toBeInstanceOf(Array)

      // Get specific cookie
      const cookie = await page.getCookie('test')
      expect(cookie?.value).toBe('value123')

      // Delete cookie
      await page.deleteCookie('test')

      // Clear all cookies
      await page.clearCookies()
    })
  })
})

describe('Scrolling', () => {
  test('should scroll to coordinates', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')
      await page.scrollTo(0, 500)
    })
  })

  test('should scroll to element', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToElement('p')
    })
  })

  test('should scroll to top', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToBottom()
      await page.scrollToTop()
    })
  })

  test('should scroll to bottom', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToBottom()
    })
  })
})

describe('Console Log Capture', () => {
  test('should capture console logs', async () => {
    await browse(async (page) => {
      await page.startConsoleCapture()

      await page.goto('https://example.com')

      await page.evaluate(() => {
        // eslint-disable-next-line no-console
        console.log('Test log')
        console.warn('Test warning')
        console.error('Test error')
      })

      await page.waitFor(100)

      const logs = page.getConsoleLogs()
      expect(logs.length).toBeGreaterThanOrEqual(3)

      // Verify we captured all three log types
      const logTypes = logs.map(l => l.type)
      expect(logTypes).toContain('log')
      expect(logTypes).toContain('warn')
      expect(logTypes).toContain('error')

      page.clearConsoleLogs()
      expect(page.getConsoleLogs().length).toBe(0)
    })
  })
})

describe('Error Handling', () => {
  test('should handle missing elements', async () => {
    await browse(async (page) => {
      await page.goto('https://example.com')

      try {
        await page.waitForSelector('.non-existent-element', { timeout: 500 })
        throw new Error('Should have thrown')
      }
      catch (error: any) {
        expect(error.message).toContain('Timeout waiting for selector')
      }
    })
  })
})
