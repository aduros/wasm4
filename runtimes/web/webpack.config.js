const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs/promises');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const HTMLInlineCSSWebpackPlugin =
  require('html-inline-css-webpack-plugin').default;

const ENCODER =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'.split(
    ''
  );

function z85Encode(src) {
  const size = src.length;
  const extra = size % 4;
  const paddedSize = extra ? size + 4 - extra : size;

  let str = '',
    byte_nbr = 0,
    value = 0;
  while (byte_nbr < paddedSize) {
    const b = byte_nbr < size ? src[byte_nbr] : 0;
    ++byte_nbr;
    value = value * 256 + b;
    if (byte_nbr % 4 == 0) {
      let divisor = 85 * 85 * 85 * 85;
      while (divisor >= 1) {
        const idx = Math.floor(value / divisor) % 85;
        str += ENCODER[idx];
        divisor /= 85;
      }
      value = 0;
    }
  }

  return str;
}

async function generateBuildConfig() {
  const cartFilepath = process.env.WASM4_CART_ABSOLUTE_FILEPATH;
  let WASM4_CART = '';
  let WASM4_CART_SIZE = 0;

  if (cartFilepath) {
    const buffer = await fs.readFile(cartFilepath);
    WASM4_CART_SIZE = buffer.length;

    WASM4_CART = z85Encode(buffer);
  }

  // Use only env var prefixed by `WASM4_`.
  const buildConfig = {
    CART_NAME: process.env.WASM4_CART_NAME ?? 'Wasm 4 cart',
    CART_DESCRIPTION:
      process.env.WASM4_CART_DESCRIPTION ??
      'A cartrige for Wasm 4: https://wasm4.org/',
    INLINE_ASSETS: process.env.WASM4_INLINE_ASSETS === 'true',
    FAVICON_HREF:
      process.env.WASM4_FAVICON_HREF ?? 'https://wasm4.org/img/favicon.ico',
    WASM4_CART,
    WASM4_CART_SIZE,
    BUILD_DATE: new Date().toISOString(),
    WASM4_VERSION: process.env.WASM4_VERSION ?? '',
  };

  return buildConfig;
}

/**
 * @param {ReturnType<typeof generateBuildConfig>} conf
 */
const addInlinePlugins = ({ INLINE_ASSETS }) => {
  if (INLINE_ASSETS) {
    return [
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/^wasm4/]),
      new HTMLInlineCSSWebpackPlugin({ leaveCSSFile: true }),
    ];
  }

  return [];
};

async function generateWebapackConfig() {
  const buildConfig = await generateBuildConfig();

  return {
    entry: './src/index.js',
    output: {
      filename: 'wasm4.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'wasm4.css',
      }),
      // @see https://github.com/jantimon/html-webpack-plugin#options
      // @see https://github.com/jaketrent/html-webpack-template#example
      new HtmlWebpackPlugin({
        title: buildConfig.CART_NAME,
        template: 'src/template.html',
        inject: 'body',
        meta: [
          {
            name: 'description',
            content: buildConfig.CART_DESCRIPTION,
          },
        ],
        buildConfig,
      }),
      ...addInlinePlugins(buildConfig),
    ],
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
    },
  };
}

module.exports = generateWebapackConfig();
