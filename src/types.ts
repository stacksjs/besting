export interface BestingConfig {
  verbose: boolean
  baseUrl?: string
}

export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: any
  json: () => Promise<any>
  text: () => Promise<string>
}

export interface ApiRequestOptions {
  headers?: Record<string, string>
  query?: Record<string, string>
  data?: any
  json?: boolean
  timeout?: number
}

export interface ApiTestCase {
  get: (url: string, options?: ApiRequestOptions) => Promise<ApiResponse>
  post: (url: string, data?: any, options?: ApiRequestOptions) => Promise<ApiResponse>
  put: (url: string, data?: any, options?: ApiRequestOptions) => Promise<ApiResponse>
  patch: (url: string, data?: any, options?: ApiRequestOptions) => Promise<ApiResponse>
  delete: (url: string, options?: ApiRequestOptions) => Promise<ApiResponse>
  head: (url: string, options?: ApiRequestOptions) => Promise<ApiResponse>
  options: (url: string, options?: ApiRequestOptions) => Promise<ApiResponse>
  baseUrl: (url: string) => ApiTestCase
  withHeaders: (headers: Record<string, string>) => ApiTestCase
  withToken: (token: string) => ApiTestCase
  withBasicAuth: (username: string, password: string) => ApiTestCase
  withQuery: (params: Record<string, string>) => ApiTestCase
  withJson: () => ApiTestCase
  withTimeout: (ms: number) => ApiTestCase
}

// Cache testing types
export interface CacheStore {
  get: (key: string) => Promise<any>
  set: (key: string, value: any, ttl?: number) => Promise<void>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<boolean>
  clear: () => Promise<void>
}

export interface CacheTestCase {
  assertHas: (key: string) => Promise<CacheTestCase>
  assertMissing: (key: string) => Promise<CacheTestCase>
  assertExists: (key: string) => Promise<CacheTestCase>
  assertNotExists: (key: string) => Promise<CacheTestCase>
  store: (name?: string) => CacheTestCase
  get: <T = any>(key: string) => Promise<T | null>
  set: (key: string, value: any, ttl?: number) => Promise<void>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<boolean>
  clear: () => Promise<void>
}

// Cookie testing types
export interface CookieJar {
  get: (name: string) => string | null
  set: (name: string, value: string, options?: CookieOptions) => void
  has: (name: string) => boolean
  remove: (name: string) => void
  clear: () => void
  getAll: () => Record<string, string>
}

export interface CookieOptions {
  domain?: string
  path?: string
  expires?: Date
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export interface CookieTestCase {
  assertHas: (name: string) => CookieTestCase
  assertMissing: (name: string) => CookieTestCase
  assertValue: (name: string, value: string) => CookieTestCase
  assertValueContains: (name: string, value: string) => CookieTestCase
  get: (name: string) => string | null
  set: (name: string, value: string, options?: CookieOptions) => CookieTestCase
  remove: (name: string) => CookieTestCase
  clear: () => CookieTestCase
  getAll: () => Record<string, string>
}

// Database testing types
export interface DatabaseConnection {
  table: (name: string) => any
  beginTransaction: () => Promise<any>
  dropAllTables: () => Promise<void>
  rollbackMigrations: () => Promise<void>
  raw: (sql: string, params?: any[]) => Promise<any>
}

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export type MigrationFunction = (connection: DatabaseConnection) => Promise<void>
export type SeederFunction = (connection: DatabaseConnection) => Promise<void>

export interface DatabaseFactory<T = any> {
  define: (attributes: Record<string, any>) => DatabaseFactory<T>
  state: (name: string, callback: (data: Record<string, any>) => Record<string, any>) => DatabaseFactory<T>
  has: (state: string) => DatabaseFactory<T>
  count: (n: number) => DatabaseFactory<T>
  create: (attributes?: Partial<T>) => Promise<T | T[]>
  make: (attributes?: Partial<T>) => T | T[]
}

// Event testing types
export interface EventDispatcher {
  dispatch: (event: any) => void
  listen: (eventName: string, callback: (event: any) => void) => void
  fake: () => EventFake
}

export interface EventFake {
  assertDispatched: (eventName: string, callback?: (event: any) => boolean) => EventFake
  assertDispatchedTimes: (eventName: string, times: number) => EventFake
  assertNotDispatched: (eventName: string) => EventFake
  getDispatched: (eventName: string) => any[]
}

// Command testing types
export interface CommandTester {
  execute: (command: string, args?: string[]) => Promise<CommandResult>
  assertExitCode: (exitCode: number) => CommandTester
  assertOutputContains: (text: string) => CommandTester
  assertOutputNotContains: (text: string) => CommandTester
  getResult: () => CommandResult
}

export interface CommandResult {
  exitCode: number
  output: string
  errorOutput: string
}

// Authentication testing types
export interface AuthTester {
  actingAs: (user: any) => AuthTester
  actingAsGuest: () => AuthTester
  assertAuthenticated: () => AuthTester
  assertGuest: () => AuthTester
  user: () => any
  check: () => boolean
}
