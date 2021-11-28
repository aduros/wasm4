const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
    ],
    optimization: {
        minimizer: [
            "...",
            new CssMinimizerPlugin(),
        ]
    },
};
