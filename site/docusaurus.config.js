const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const CARTS = require('./carts');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'WASM-4',
  tagline: 'Build retro games using WebAssembly for a fantasy console',
  url: 'https://wasm4.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'aduros', // Usually your GitHub org/user name.
  projectName: 'wasm4', // Usually your repo name.
  themeConfig: {
    image: 'img/logo.png',
    metadatas: [
        { name: 'description', property: 'og:description', content: 'Build retro games using WebAssembly for a fantasy console' },
    ],
    announcementBar: {
      id: 'gamejam1',
      content: '📅 Join the first <a target="_blank" style="font-weight: bold" href="https://itch.io/jam/wasm4">WASM-4 Game Jam</a> on January 14 - 23!',
      backgroundColor: '#9bc86a',
    },
    navbar: {
      title: 'WASM-4',
      logo: {
        alt: 'WASM-4 Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/play', label: 'Play', position: 'left'},
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Learn',
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/community', label: 'Community', position: 'left'},
        {
          href: 'https://github.com/aduros/wasm4',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        // {
        //   type: 'search',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      // style: 'dark',
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Tutorial',
      //         to: '/docs/intro',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'Twitter',
      //         href: 'https://twitter.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/facebook/docusaurus',
      //       },
      //     ],
      //   },
      // ],
      // copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['rust', 'd', 'nim', 'zig'],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    algolia: {
      apiKey: 'd2a6c52773edfa8a691cbd670d02e0f6',
      indexName: 'wasm4',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/aduros/wasm4/edit/main/site/',
        },
        blog: {
          showReadingTime: false,
          // Please change this to your repo.
          // editUrl: 'https://github.com/aduros/wasm4/edit/main/site/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
      function cartsPlugin (context, options) {
          return {
              name: "carts-plugin",
              async contentLoaded ({ content, actions }) {
                  const cartsJsonPath = await actions.createData("carts.json", JSON.stringify(CARTS));

                  actions.addRoute({
                      path: "/play",
                      component: "@site/src/components/Carts",
                      modules: {
                          carts: cartsJsonPath,
                      },
                      exact: true,
                  });

                  for (let cart of CARTS) {
                      const cartJsonPath = await actions.createData(`cart-${cart.slug}.json`, JSON.stringify(cart));
                      actions.addRoute({
                          path: "/play/"+cart.slug,
                          component: "@site/src/components/PlayCart",
                          modules: {
                              cart: cartJsonPath,
                          },
                          exact: true,
                      });
                  }
              },
          }
      }
  ],
};
