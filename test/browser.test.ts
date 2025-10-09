import { describe, expect, test } from 'bun:test'
import { browser, browseTest } from '../src/browser'

describe('Browser Testing', () => {
  test.skip('should navigate to a page', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.assertTitle('Example Domain')
      await page.assertSee('Example Domain')
    })
  })

  test.skip('should fill and submit a form', async () => {
    const br = browser({ headless: true })

    try {
      await br.launch()
      const page = await br.newPage()

      // Navigate to a form page
      await page.goto('https://httpbin.org/forms/post')

      // Fill in form fields
      await page.fill('input[name="custname"]', 'John Doe')
      await page.fill('input[name="custtel"]', '555-1234')
      await page.fill('input[name="custemail"]', 'john@example.com')

      // Select from dropdown
      await page.select('select[name="size"]', 'large')

      // Check boxes
      await page.check('input[name="topping"][value="bacon"]')

      // Click submit
      await page.click('button[type="submit"]')

      // Wait for response
      await page.waitFor(1000)

      // Assert we're on the results page
      await page.assertUrlContains('/post')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should interact with elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      // Check element visibility
      const isVisible = await page.isVisible('h1')
      expect(isVisible).toBe(true)

      // Get element text
      const heading = await page.text('h1')
      expect(heading).toBe('Example Domain')

      // Take a screenshot
      const screenshot = await page.screenshot()
      expect(screenshot).toBeInstanceOf(Buffer)
    })
  })

  test.skip('should handle navigation', async () => {
    await browseTest(async (page) => {
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

  test.skip('should execute JavaScript', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      // Execute JavaScript on the page
      const result = await page.evaluate(() => {
        return document.querySelectorAll('p').length
      })

      expect(typeof result).toBe('number')
    })
  })

  test.skip('should handle selectors', async () => {
    await browseTest(async (page) => {
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

  test.skip('should use Laravel Dusk-style assertions', async () => {
    await browseTest(async (page) => {
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

  test.skip('should handle keyboard input', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      // Press a key
      await page.press('Tab')
      await page.press('Enter')
    })
  })

  test.skip('should take screenshots', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      // Take full page screenshot
      const fullPage = await page.screenshot({ fullPage: true })
      expect(fullPage).toBeInstanceOf(Buffer)

      // Take screenshot and save to file
      await page.screenshot({
        path: 'test-screenshot.png',
        type: 'png',
      })
    })
  })

  test.skip('should set viewport size', async () => {
    await browseTest(async (page) => {
      // Set custom viewport
      await page.setViewport(1920, 1080)

      await page.goto('https://example.com')

      // Verify page loaded
      await page.assertPresent('body')
    })
  })

  test.skip('should handle multiple pages', async () => {
    const br = browser({ headless: true })

    try {
      await br.launch()

      // Create multiple pages
      const page1 = await br.newPage()
      const page2 = await br.newPage()

      // Navigate each page independently
      await page1.goto('https://example.com')
      await page2.goto('https://httpbin.org')

      // Assert each page
      await page1.assertUrlContains('example.com')
      await page2.assertUrlContains('httpbin.org')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should handle form elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://httpbin.org/forms/post')

      // Type into input
      await page.type('input[name="custname"]', 'John Doe')

      // Get input value
      const name = await page.value('input[name="custname"]')
      expect(name).toBe('John Doe')

      // Assert value
      await page.assertValue('input[name="custname"]', 'John Doe')
    })
  })

  test.skip('should handle checkboxes and radio buttons', async () => {
    await browseTest(async (page) => {
      await page.goto('https://httpbin.org/forms/post')

      // Check a checkbox
      await page.check('input[name="topping"][value="bacon"]')
      await page.assertChecked('input[name="topping"][value="bacon"]')

      // Uncheck a checkbox
      await page.uncheck('input[name="topping"][value="bacon"]')
      await page.assertNotChecked('input[name="topping"][value="bacon"]')
    })
  })

  test.skip('should wait for text to appear', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      // Wait for specific text
      await page.waitForText('Example Domain', { timeout: 5000 })
    })
  })

  test.skip('should handle focus and blur', async () => {
    await browseTest(async (page) => {
      await page.goto('https://httpbin.org/forms/post')

      // Focus on input
      await page.focus('input[name="custname"]')

      // Type text (will type into focused element)
      await page.type('input[name="custname"]', 'Test')

      // Blur the input
      await page.blur('input[name="custname"]')
    })
  })
})

describe('Browser Configuration', () => {
  test.skip('should launch in headless mode', async () => {
    const br = browser({ headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')
      await page.assertPresent('body')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should launch with custom viewport', async () => {
    const br = browser({
      headless: true,
      width: 1920,
      height: 1080,
    })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')
      await page.assertPresent('body')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should launch with devtools', async () => {
    const br = browser({
      headless: false,
      devtools: true,
    })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')
      await page.waitFor(2000) // Give time to see devtools
    }
    finally {
      await br.close()
    }
  })
})

describe('Firefox Browser', () => {
  test.skip('should launch Firefox and navigate', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')
      await page.assertSee('Example Domain')
      await page.assertTitle('Example Domain')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should interact with elements in Firefox', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')

      // Check element visibility
      const isVisible = await page.isVisible('h1')
      expect(isVisible).toBe(true)

      // Get element text
      const heading = await page.text('h1')
      expect(heading).toBe('Example Domain')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should handle multiple pages in Firefox', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()

      const page1 = await br.newPage()
      const page2 = await br.newPage()

      await page1.goto('https://example.com')
      await page2.goto('https://httpbin.org')

      await page1.assertUrlContains('example.com')
      await page2.assertUrlContains('httpbin.org')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should capture screenshots in Firefox', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')

      const screenshot = await page.screenshot()
      expect(screenshot).toBeInstanceOf(Buffer)
      expect(screenshot.length).toBeGreaterThan(0)
    }
    finally {
      await br.close()
    }
  })

  test.skip('should work with Firefox storage APIs', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')

      // Local Storage
      await page.setLocalStorage('test', 'value')
      const value = await page.getLocalStorage('test')
      expect(value).toBe('value')

      // Session Storage
      await page.setSessionStorage('tab', 'home')
      const tab = await page.getSessionStorage('tab')
      expect(tab).toBe('home')
    }
    finally {
      await br.close()
    }
  })

  test.skip('should handle cookies in Firefox', async () => {
    const br = browser({ browser: 'firefox', headless: true })

    try {
      await br.launch()
      const page = await br.newPage()
      await page.goto('https://example.com')

      await page.setCookie('test', 'value123')
      const cookies = await page.getCookies()
      expect(cookies).toBeInstanceOf(Array)

      const cookie = await page.getCookie('test')
      expect(cookie?.value).toBe('value123')
    }
    finally {
      await br.close()
    }
  })
})

describe('Error Handling', () => {
  test.skip('should handle navigation timeout', async () => {
    await browseTest(async (page) => {
      try {
        await page.goto('https://invalid-domain-that-does-not-exist.com', {
          timeout: 2000,
        })
        throw new Error('Should have thrown timeout error')
      }
      catch (error: any) {
        expect(error.message).toContain('timeout')
      }
    })
  })

  test.skip('should handle missing elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      try {
        await page.click('.non-existent-element', { timeout: 2000 })
        throw new Error('Should have thrown')
      }
      catch (error: any) {
        expect(error.message).toContain('Timeout waiting for selector')
      }
    })
  })
})

describe('Advanced Mouse Interactions', () => {
  test.skip('should hover over elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.hover('h1')
    })
  })

  test.skip('should double click elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.doubleClick('h1')
    })
  })

  test.skip('should right click elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.rightClick('h1')
    })
  })

  test.skip('should drag and drop elements', async () => {
    await browseTest(async (page) => {
      await page.goto('https://html5demos.com/drag')
      await page.drag('#one', '#bin')
    })
  })
})

describe('Cookie Management', () => {
  test.skip('should manage cookies', async () => {
    await browseTest(async (page) => {
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

describe('Local Storage & Session Storage', () => {
  test.skip('should manage local storage', async () => {
    await browseTest(async (page) => {
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

  test.skip('should manage session storage', async () => {
    await browseTest(async (page) => {
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

describe('Scrolling', () => {
  test.skip('should scroll to coordinates', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.scrollTo(0, 500)
    })
  })

  test.skip('should scroll to element', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToElement('p')
    })
  })

  test.skip('should scroll to top', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToBottom()
      await page.scrollToTop()
    })
  })

  test.skip('should scroll to bottom', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')
      await page.scrollToBottom()
    })
  })
})

describe('Dialog Handling', () => {
  test.skip('should handle alert dialogs', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      await page.onDialog(async (message) => {
        expect(message).toContain('alert')
        return true
      })

      await page.evaluate(() => {
        alert('Test alert')
      })
    })
  })

  test.skip('should handle confirm dialogs', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      await page.onDialog(async (message) => {
        return message.includes('yes')
      })

      const result = await page.evaluate(() => {
        return confirm('Click yes?')
      })

      expect(result).toBe(true)
    })
  })

  test.skip('should handle prompt dialogs', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      await page.onDialog(async (message) => {
        if (message.includes('name')) {
          return 'John Doe'
        }
        return false
      })

      const result = await page.evaluate(() => {
        return prompt('Enter your name:')
      })

      expect(result).toBe('John Doe')
    })
  })
})

describe('Console Log Capture', () => {
  test.skip('should capture console logs', async () => {
    await browseTest(async (page) => {
      await page.startConsoleCapture()

      await page.goto('https://example.com')

      await page.evaluate(() => {
        console.log('Test log')
        console.warn('Test warning')
        console.error('Test error')
      })

      await page.waitFor(500)

      const logs = page.getConsoleLogs()
      expect(logs.length).toBeGreaterThan(0)

      page.clearConsoleLogs()
      expect(page.getConsoleLogs().length).toBe(0)
    })
  })
})

describe('PDF Generation', () => {
  test.skip('should generate PDF', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      const pdf = await page.pdf()
      expect(pdf).toBeInstanceOf(Buffer)
      expect(pdf.length).toBeGreaterThan(0)
    })
  })

  test.skip('should generate PDF with options', async () => {
    await browseTest(async (page) => {
      await page.goto('https://example.com')

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
      })

      expect(pdf).toBeInstanceOf(Buffer)
    })
  })
})

describe('Network Control', () => {
  test.skip('should set offline mode', async () => {
    await browseTest(async (page) => {
      await page.setOffline(true)

      try {
        await page.goto('https://example.com', { timeout: 5000 })
      }
      catch (error) {
        // Expected to fail
      }

      await page.setOffline(false)
    })
  })

  test.skip('should throttle network', async () => {
    await browseTest(async (page) => {
      await page.setNetworkThrottle('slow3G')
      await page.goto('https://example.com')

      await page.setNetworkThrottle('fast3G')
      await page.goto('https://example.com')

      await page.setNetworkThrottle('none')
    })
  })
})

describe('Mobile Emulation', () => {
  test.skip('should emulate iPhone', async () => {
    await browseTest(async (page) => {
      await page.emulateDevice('iPhone')
      await page.goto('https://example.com')
      await page.assertPresent('body')
    })
  })

  test.skip('should emulate iPad', async () => {
    await browseTest(async (page) => {
      await page.emulateDevice('iPad')
      await page.goto('https://example.com')
      await page.assertPresent('body')
    })
  })

  test.skip('should emulate Pixel', async () => {
    await browseTest(async (page) => {
      await page.emulateDevice('Pixel')
      await page.goto('https://example.com')
      await page.assertPresent('body')
    })
  })

  test.skip('should set custom user agent', async () => {
    await browseTest(async (page) => {
      await page.setUserAgent('Custom User Agent')
      await page.goto('https://example.com')
    })
  })

  test.skip('should set geolocation', async () => {
    await browseTest(async (page) => {
      await page.setGeolocation(37.7749, -122.4194)
      await page.goto('https://example.com')
    })
  })

  test.skip('should enable touch emulation', async () => {
    await browseTest(async (page) => {
      await page.setTouchEmulation(true)
      await page.goto('https://example.com')
    })
  })
})
