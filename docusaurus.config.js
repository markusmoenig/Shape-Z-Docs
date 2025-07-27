// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Shape-Z',
  tagline: 'Shape Prozessing Language',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://shape-z.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'markusmoenig', // Usually your GitHub org/user name.
  projectName: 'Shape-Z', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `window.coi = {
      // Prefer COEP: require-corp (most consistent across browsers)
      coepCredentialless: () => false,
      // allow fallback if SW decides to degrade
      coepDegrade: () => true,
      // one-time reload helper (used by the SW)
      doReload: () => window.location.reload(),
      quiet: false
    };`,
    },
    { tagName: 'script', attributes: { src: '/coi-serviceworker.min.js' } },
    { tagName: 'script', attributes: { type: 'module', src: '/wasm/wasm-loader.js' } },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      },
    },
  ],

  plugins: [
    function customWebpackConfig() {
      return {
        name: 'custom-webpack-config',
        configureWebpack() {
          return {
            resolve: {
              fallback: {
                path: false,
              },
            },
          };
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Social card
      image: 'img/shape-z-round.png',
      metadata: [
        { name: 'keywords', content: 'Shape-Z, voxel, programming, procedural, modeling, language' },
        { name: 'author', content: 'Markus Moenig' },
        // { name: 'twitter:card', content: 'summary_large_image' },
        // { name: 'og:title', content: 'Shape-Z – Shape Processing Language' },
        // { name: 'og:image', content: 'https://shape-z.com/img/og-shapez.png' },
      ],
      navbar: {
        title: 'Shape-Z',
        logo: {
          alt: 'Shape-Z Logo',
          src: 'img/shape-z-header.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          { to: "/news", label: "News", position: "left" },
          {
            type: "html",
            position: "right",
            value: `
              <a href="https://github.com/markusmoenig/shape-z" class="navbar-icon" title="GitHub Repository">
                <i class="fab fa-github"></i>
              </a>
            `,
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Installation',
                to: '/docs/installation',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'X',
                href: 'https://x.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Markus Moenig.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;