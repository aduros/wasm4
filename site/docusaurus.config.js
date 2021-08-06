const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const CARTS = [
    { id: "watris", title: "Watris", author: "Bruno Garcia" },
    { id: "watris2", title: "Watris 2", author: "Bruno Garcia" },
];

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'WASM-4',
  // tagline: 'A fantasy console for retro games built with WebAssembly',
  tagline: 'Build retro games using WebAssembly for a fantasy console',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'aduros', // Usually your GitHub org/user name.
  projectName: 'wasm4', // Usually your repo name.
  themeConfig: {
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
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
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
                      const cartJsonPath = await actions.createData(`cart-${cart.id}.json`, JSON.stringify(cart));
                      actions.addRoute({
                          path: "/play/"+cart.id,
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
