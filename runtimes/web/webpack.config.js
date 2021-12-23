const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require('webpack');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "wasm4.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "wasm4.css",
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          })
    ],
    optimization: {
        minimizer: [
            "...",
            new CssMinimizerPlugin(),
        ]
    },
};
