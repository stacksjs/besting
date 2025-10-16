/**
 * Clipboard API implementation
 * Provides in-memory clipboard for testing
 */

import { Geolocation } from './BrowserAPIs'

export class Clipboard {
  private _text = ''

  async writeText(text: string): Promise<void> {
    this._text = text
  }

  async readText(): Promise<string> {
    return this._text
  }

  async write(data: ClipboardItems): Promise<void> {
    // Simplified implementation
    for (const item of data) {
      for (const type of item.types) {
        const blob = await item.getType(type)
        if (type === 'text/plain') {
          this._text = await blob.text()
        }
      }
    }
  }

  async read(): Promise<ClipboardItems> {
    const blob = new Blob([this._text], { type: 'text/plain' })
    const item = new ClipboardItem({
      'text/plain': blob,
    })
    return [item]
  }
}

export class Navigator {
  public clipboard = new Clipboard()
  public geolocation = new Geolocation()
  public userAgent = 'Mozilla/5.0 (X11; Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) VeryHappyDOM/1.0.0'
  public language = 'en-US'
  public languages = ['en-US', 'en']
  public platform = 'Linux x86_64'
  public cookieEnabled = true
  public onLine = true
}

type ClipboardItems = ClipboardItem[]

declare class ClipboardItem {
  constructor(data: Record<string, Blob | string | Promise<Blob | string>>)
  readonly types: string[]
  getType(type: string): Promise<Blob>
}
