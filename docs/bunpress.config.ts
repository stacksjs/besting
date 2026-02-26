import type { BunPressOptions } from 'bunpress'

const config: BunPressOptions = {
  name: 'besting',
  description: 'A Jest and Pest inspired testing framework for Bun with zero external dependencies.',
  url: 'https://besting.stacksjs.org',

  theme: {
    primaryColor: '#22c55e',
  },

  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'Assertions', link: '/guide/assertions' },
    { text: 'DOM Testing', link: '/guide/dom-testing' },
    {
      text: 'Stacks',
      items: [
        { text: 'Stacks Framework', link: 'https://stacksjs.org' },
        { text: 'clapp', link: 'https://clapp.stacksjs.org' },
        { text: 'BunPress', link: 'https://bunpress.sh' },
      ],
    },
    { text: 'GitHub', link: 'https://github.com/stacksjs/besting' },
  ],

  sidebar: [
    {
      text: 'Introduction',
      items: [
        { text: 'What is besting?', link: '/intro' },
        { text: 'Installation', link: '/install' },
      ],
    },
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Assertions', link: '/guide/assertions' },
        { text: 'DOM Testing', link: '/guide/dom-testing' },
        { text: 'API Testing', link: '/guide/api-testing' },
        { text: 'Database Testing', link: '/guide/database-testing' },
        { text: 'Browser Testing', link: '/guide/browser-testing' },
      ],
    },
    {
      text: 'Features',
      items: [
        { text: 'Test Suites', link: '/features/test-suites' },
        { text: 'Matchers', link: '/features/matchers' },
        { text: 'Mocking', link: '/features/mocking' },
        { text: 'Snapshots', link: '/features/snapshots' },
      ],
    },
    {
      text: 'Advanced',
      items: [
        { text: 'Configuration', link: '/advanced/configuration' },
        { text: 'Custom Matchers', link: '/advanced/custom-matchers' },
        { text: 'Performance', link: '/advanced/performance' },
        { text: 'CI/CD Integration', link: '/advanced/ci-cd' },
      ],
    },
    {
      text: 'Reference',
      items: [
        { text: 'API Reference', link: '/api-reference' },
        { text: 'Usage Examples', link: '/usage' },
      ],
    },
  ],

  sitemap: {
    enabled: true,
    baseUrl: 'https://besting.stacksjs.org',
  },

  robots: {
    enabled: true,
  },
}

export default config
