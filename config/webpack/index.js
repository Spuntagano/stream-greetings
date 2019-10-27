const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs-extra')
const postcssAssets = require('postcss-assets')
const postcssNext = require('postcss-cssnext')
const stylelint = require('stylelint')
const ManifestPlugin = require('webpack-manifest-plugin')
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin
const darkTheme = require('@ant-design/dark-theme')


module.exports = (_env, argv) => {
    let entryPoints = {
        settings: {
            path: ['./src/settings.tsx', './src/vendor/main.ts'],
            outputHtml: 'settings.html',
            build: true
        },
        source: {
            path: ['./src/source.tsx', './src/vendor/main.ts'],
            outputHtml: 'widget.html',
            build: true
        }
    }

    let entry = {}

    // edit webpack plugins here!
    let plugins = [
        new CheckerPlugin(),
        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                tslint: {
                    failOnHint: true,
                },
            },
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                API_URL_BASE_PATH: 'https://ga7nmsy60j.execute-api.ca-central-1.amazonaws.com/test'
            }),
        })
    ]

    for (name in entryPoints) {
        if (entryPoints[name].build) {
            entry[name] = entryPoints[name].path
        }
    }

    let config = {
        entry,
        devtool: 'source-map',
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    loader: 'tslint-loader',
                },
                {
                    test: /\.tsx?$/,
                    loaders: ['awesome-typescript-loader'],
                },
                {
                    test: /\.jsx$/,
                    loader: 'babel-loader',
                },
                {
                    test: /\.scss$/,
                    include: path.resolve('./src/app'),
                    loaders: [
                        'style-loader',
                        'css-loader?modules',
                        'sass-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    stylelint({
                                        files: '../../src/app/*.scss',
                                    }),
                                    postcssNext(),
                                    postcssAssets({
                                        relative: true,
                                    }),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    loaders: [{
                        loader: 'style-loader'
                    }, {
                        loader: 'css-loader'
                    }, {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                            modifyVars: {
                                ...darkTheme.default
                            }
                        }
                    }]
                },
                {
                    test: /\.eot(\?.*)?$/,
                    loader: 'file-loader?name=fonts/[hash].[ext]',
                },
                {
                    test: /\.(woff|woff2)(\?.*)?$/,
                    loader: 'file-loader?name=fonts/[hash].[ext]',
                },
                {
                    test: /\.ttf(\?.*)?$/,
                    loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[hash].[ext]',
                },
                {
                    test: /\.svg(\?.*)?$/,
                    loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[hash].[ext]',
                },
                {
                    test: /\.(jpe?g|png|gif)$/i,
                    loader: 'url-loader?limit=1000&name=images/[hash].[ext]',
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            modules: [path.resolve(__dirname), 'node_modules', 'app', 'app/redux'],
        },
        output: {
            path: path.resolve('./build/public/'),
            publicPath: '/',
            filename: 'assets/js/[name].js',
            pathinfo: true,
        },
        plugins
    }

    if (argv.mode === 'development') {
        config.devServer = {
            contentBase: path.resolve('./build/public'),
            host: 'localhost',
            publicPath: '/',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            port: 8080
        }
    }

    return config
}

fs.copySync('./src/favicon.ico', './build/public/favicon.ico')
fs.copySync('./src/settings.html', './build/public/settings.html')
fs.copySync('./src/source.html', './build/public/source.html')
fs.copySync('./src/banner.png', './build/public/banner.png')
fs.copySync('./src/assets', './build/public/assets')
