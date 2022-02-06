const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = import('remark-rehype');
const rehypeStringify = import('rehype-stringify');
const utils = require("@docusaurus/utils");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

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
      additionalLanguages: ['rust', 'd', 'lua', 'nim', 'zig'],
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
                  const markdownRenderer = unified()
                      .use(remarkParse, {commonmark: true})
                      .use((await remarkRehype).default)
                      .use((await rehypeStringify).default)

                  const allCarts = [];

                  for (let wasmFile of glob.sync("static/carts/*.wasm")) {
                      const slug = path.basename(wasmFile, ".wasm");
                      // Load cart metadata
                      let cartData;
                      try {
                          if (!fs.existsSync(`static/carts/${slug}.png`)) {
                              throw new Error("Missing screenshot");
                          }

                          const markdown = await utils.parseMarkdownFile(`static/carts/${slug}.md`, {
                              removeContentTitle: true,
                          });
                          const readme = await markdownRenderer.process(markdown.content);

                          const title = markdown.contentTitle;
                          if (!title) {
                              throw new Error("Missing content title in markdown");
                          }

                          const author = markdown.frontMatter.author;
                          if (!author) {
                              throw new Error("Missing author");
                          }

                          const github = markdown.frontMatter.github;
                          if (!github) {
                              throw new Error("Missing github");
                          }

                          const date = new Date(markdown.frontMatter.date).getTime();
                          if (!date) {
                              throw new Error("Missing date");
                          }

                          cartData = {
                              slug, title, author, github, date, readme: readme.contents,
                          };
                          allCarts.push(cartData);

                      } catch (error) {
                          console.error(error);
                          throw new Error(`Error processing ${slug}`);
                      }

                      const cartJsonPath = await actions.createData(`cart-${slug}.json`, JSON.stringify(cartData));
                      actions.addRoute({
                          path: `/play/${slug}`,
                          component: "@site/src/components/PlayCart",
                          modules: {
                              cart: cartJsonPath,
                          },
                          exact: true,
                      });
                  }

                  const indexData = allCarts.sort((a, b) => b.date - a.date).map(cartData => ({
                      slug: cartData.slug,
                      title: cartData.title,
                      author: cartData.author,
                  }));
                  const cartsJsonPath = await actions.createData("carts.json", JSON.stringify(indexData));
                  actions.addRoute({
                      path: "/play",
                      component: "@site/src/components/Carts",
                      modules: {
                          carts: cartsJsonPath,
                      },
                      exact: true,
                  });
              },
          }
      }
  ],
};
