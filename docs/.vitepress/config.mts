import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Outbound SDK',
  description: 'Official Node.js SDK for the Outbound email platform',
  base: '/Outbound/',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/email' },
      { text: 'Swagger ↗', link: 'https://outbound-api.mastersunion.org/docs/' },
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
    socialLinks: [
      {
        icon: { svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 1.144c5.995 0 10.856 4.861 10.856 10.856S17.995 22.856 12 22.856 1.144 17.995 1.144 12 6.005 1.144 12 1.144zM8.37 5.868a6.707 6.707 0 0 0-.423.005c-.983.056-1.573.517-1.735 1.472-.115.665-.096 1.348-.143 2.017-.013.35-.05.697-.115 1.038-.134.609-.397.895-1.013 1.003-.1.02-.199.04-.3.058v1.066c.477.073.876.191 1.09.645.166.35.218.735.24 1.12.026.463.016.93.057 1.399.062.711.09 1.443.498 2.075.337.508.787.736 1.384.764.248.014.497.005.748.005v-1.08c-.253 0-.467.005-.68-.003-.376-.013-.584-.213-.644-.58a7.57 7.57 0 0 1-.08-.96c-.02-.552-.003-1.107-.063-1.655-.07-.648-.2-1.278-.75-1.74l-.04-.036c.549-.46.683-1.09.754-1.74.06-.55.042-1.104.063-1.656.01-.323.03-.648.08-.965.06-.362.268-.563.638-.577.213-.01.427-.003.68-.003V5.87a5.325 5.325 0 0 0-.246-.003zm7.007 0a5.325 5.325 0 0 0-.247.003v1.077c.255 0 .468-.007.68.002.372.014.58.215.64.578.05.317.07.642.08.965.02.552.003 1.107.063 1.656.07.65.205 1.28.754 1.74l-.04.037c-.55.461-.684 1.091-.755 1.74-.06.548-.042 1.103-.062 1.655-.01.32-.03.642-.08.96-.06.368-.268.568-.644.58-.213.01-.427.004-.68.004v1.08c.251 0 .5.009.748-.006.597-.027 1.047-.256 1.384-.764.409-.632.436-1.364.498-2.075.04-.468.032-.936.057-1.399.022-.385.074-.77.24-1.12.214-.454.613-.572 1.09-.645v-1.066a2.198 2.198 0 0 1-.3-.058c-.616-.108-.879-.394-1.013-1.003a6.418 6.418 0 0 1-.115-1.038c-.047-.67-.028-1.352-.143-2.017-.162-.955-.752-1.416-1.735-1.472a6.707 6.707 0 0 0-.423-.005zM12 8.21c-.474 0-.858.385-.858.86s.384.858.858.858.858-.383.858-.858-.384-.86-.858-.86zm-3.12 2.248c-.474 0-.86.384-.86.858 0 .474.386.86.86.86s.858-.386.858-.86c0-.474-.384-.858-.858-.858zm6.24 0c-.474 0-.858.384-.858.858 0 .474.384.86.858.86s.86-.386.86-.86c0-.474-.386-.858-.86-.858z" fill="currentColor"/></svg>' },
        link: 'https://outbound-api.mastersunion.org/docs/',
        ariaLabel: 'Swagger API Docs',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 Masters Union',
    },
    search: {
      provider: 'local',
    },
  },
});
