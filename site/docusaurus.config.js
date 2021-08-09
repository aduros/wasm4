const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const CARTS = [
    { id: "watris", title: "Watris", author: "Bruno Garcia", github: "aduros" },
    { id: "watris2", title: "Watris 2", author: "Bruno Garcia", github: "aduros" },
    { id: "watris3", title: "Watris 3", author: "Bruno Garcia", github: "aduros" },
    { id: "watris4", title: "Watris 4", author: "Bruno Garcia", github: "aduros" },
    { id: "watris5", title: "Watris 5", author: "Bruno Garcia", github: "aduros" },
    { id: "watris6", title: "Watris 6", author: "Bruno Garcia", github: "aduros" },
    { id: "watris7", title: "Watris 7", author: "Bruno Garcia", github: "aduros" },
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
          label: 'Learn',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/blog', label: 'Community', position: 'left'},
        // {
        //   href: 'https://github.com/aduros/wasm4',
        //   label: 'GitHub',
        //   position: 'right',
        // },
        {
          href: 'https://github.com/aduros/wasm4',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          type: 'search',
          position: 'right',
        },
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
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    algolia: {
      apiKey: '47ecd3b21be71c5822571b9f59e52544',
      indexName: 'docusaurus-2',
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
