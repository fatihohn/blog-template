const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    target: ['web', 'es5'],
    entry: {
        index: ['./dist/index.js']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js',
        chunkFilename: "[name].[fullhash].chunk.js",
        library: {
            type: "umd"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        configFile: path.resolve(__dirname, 'babel.config.js')
                    },
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [new NodePolyfillPlugin()],
    devtool: 'source-map',
    mode: 'production'
};
