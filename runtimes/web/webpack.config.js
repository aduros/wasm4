const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 */
const commonWebpackConfig = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'wasm4.css',
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
};

/**
 * @type {import('webpack').Configuration}
 */
module.exports = [
  merge(commonWebpackConfig, {
    output: { filename: 'wasm4-developer.js' },
    plugins: [new webpack.DefinePlugin({ DEVELOPER_BUILD: true })],
  }),
  merge(commonWebpackConfig, {
    output: { filename: 'wasm4.js' },
    plugins: [new webpack.DefinePlugin({ DEVELOPER_BUILD: false })],
  }),
];
