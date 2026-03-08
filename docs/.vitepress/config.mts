import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Outbound SDK',
  description: 'Official Node.js SDK for the Outbound email platform',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/email' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@masters-union/outbound-sdk' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Email', link: '/api/email' },
            { text: 'Templates', link: '/api/templates' },
            { text: 'Suppressions', link: '/api/suppressions' },
            { text: 'Webhooks', link: '/api/webhooks' },
            { text: 'Dashboard', link: '/api/dashboard' },
          ],
        },
      ],
    },
    socialLinks: [],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 Masters Union',
    },
    search: {
      provider: 'local',
    },
  },
});
