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
