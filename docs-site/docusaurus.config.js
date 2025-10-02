// @ts-check
// Minimal working configuration for debugging

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'expect-mcp',
  tagline: 'Custom Vitest matchers for testing Model Context Protocol (MCP) integrations',
  favicon: 'img/favicon.ico',

  url: 'https://andy-fischer.github.io',
  baseUrl: '/',

  organizationName: 'andy-fischer',
  projectName: 'expect-mcp',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/andy-fischer/expect-mcp/tree/main/docs-site/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'expect-mcp',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/andy-fischer/expect-mcp',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} expect-mcp.`,
      },
    }),
};

module.exports = config;
