const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra');
const postcssAssets = require('postcss-assets');
const postcssNext = require('postcss-cssnext');
const stylelint = require('stylelint');
const ManifestPlugin = require('webpack-manifest-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

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
        },
        landing: {
            path: ['./src/landing.tsx', './src/vendor/main.ts'],
            outputHtml: 'index.html',
            build: true
        },
    };

    let entry = {};

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
            'process.env': {
                ENV: JSON.stringify(process.env.NODE_ENV || 'staging'),
                STAGING: JSON.stringify({
                    SL_API_GATEWAY_URL: 'https://s21l2mphpd.execute-api.us-east-1.amazonaws.com/staging/',
                    PAYPAL_API_GATEWAY_URL: 'https://ur1j3acuch.execute-api.us-east-1.amazonaws.com/LATEST/',
                    PAYPAL_PAYMENT_URL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
                    WS_API_GATEWAY: 'wss://lz48ofxhme.execute-api.us-east-1.amazonaws.com/staging',
                    PUB_KEY: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFtR2NCd1JsMjZhUFIwcUN5NWJTNwo0SWxvTW5RWmhPWFZEWW9MRmk0QXJFY3BsR0VaMW9sK3QzNExFajhLenozbTJ6d0JNOEtTdlpDNGhCdklYRlRpCnpJdXpWNGVxVWlJaGZiSnB5NkFFSzBKZVVXSGM2SWlGenphVnVxQTUvQ3Z1aGJINUptSThzTXRNbE1SeFNGdk8KTVowMGoySDNwQUtOZ094NkNaQVpPck05ZC9LcmM5OU9GZnJIU2s2aWowcXU5bWVwdERPMWJ0RXhGZVVVZFBVOApySWRIcHl1YnU5NzNIdmF3dG1mYThWenhQaVE1Z0ptRSt4NlZmdFRPK0FFWG9kUTFtUlZzZTQ5R09IRWViMEtGCjM4SVVCSExqck9hQ2hLU04xVnN4UEcyRlZ3akpISFhVQUpJRm9ZNVBCWlM5SzdxN1JsQ1dxZkVDRy9YT3BxT3kKZkVFTSt5bWdIYmEwVCszVU9RMmZWandocytFeThjVDhJTkRxd3dNWjkzYjIrZU56dE9qTUZCeE81dHBTcEVsSwpZM2ZNNEk5bGgrKzdFbm9xdlJQSWM0dVU2QzFFUGMzWHlxSjZhZGhBd3J3cFlpUWhxNDFyWUJqMmJxaktpSlJ3CklKQjRUbkl2U1BidGJSb2tKRzRwVXhqdU9mWm1jb2owOTNhMzVhMGZzSFFFNEUzY0FoV3lOSU5rUjV0VFVFK2YKRUxNcTBGUzE5Z2hBUWx4Wkp3NlhVS2cwZHFhOHhwQWdubmdYYzU2bFd4QmtZcnNyMjN1ZVdTNGZ2NjN0YVh6dApPbFd3cWplMmNYN2FwSXZZRW1MTkcwTXFiTVRVcUU2Q05ycThpOHhjZzNGbFY1QmZueUwrNGxoMjVYNWZOYmd4CjEyS1NpNlNoQ1ZWSG9qdDZydU5qQ09zQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo='
                }),
                PRODUCTION: JSON.stringify({
                    SL_API_GATEWAY_URL: 'https://pzuf486vz6.execute-api.us-east-1.amazonaws.com/production/',
                    PAYPAL_API_GATEWAY_URL: 'https://pzuf486vz6.execute-api.us-east-1.amazonaws.com/production/',
                    PAYPAL_PAYMENT_URL: 'https://www.paypal.com/cgi-bin/webscr',
                    WS_API_GATEWAY: 'wss://isn659gqka.execute-api.us-east-1.amazonaws.com/production',
                    PUB_KEY: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFtR2NCd1JsMjZhUFIwcUN5NWJTNwo0SWxvTW5RWmhPWFZEWW9MRmk0QXJFY3BsR0VaMW9sK3QzNExFajhLenozbTJ6d0JNOEtTdlpDNGhCdklYRlRpCnpJdXpWNGVxVWlJaGZiSnB5NkFFSzBKZVVXSGM2SWlGenphVnVxQTUvQ3Z1aGJINUptSThzTXRNbE1SeFNGdk8KTVowMGoySDNwQUtOZ094NkNaQVpPck05ZC9LcmM5OU9GZnJIU2s2aWowcXU5bWVwdERPMWJ0RXhGZVVVZFBVOApySWRIcHl1YnU5NzNIdmF3dG1mYThWenhQaVE1Z0ptRSt4NlZmdFRPK0FFWG9kUTFtUlZzZTQ5R09IRWViMEtGCjM4SVVCSExqck9hQ2hLU04xVnN4UEcyRlZ3akpISFhVQUpJRm9ZNVBCWlM5SzdxN1JsQ1dxZkVDRy9YT3BxT3kKZkVFTSt5bWdIYmEwVCszVU9RMmZWandocytFeThjVDhJTkRxd3dNWjkzYjIrZU56dE9qTUZCeE81dHBTcEVsSwpZM2ZNNEk5bGgrKzdFbm9xdlJQSWM0dVU2QzFFUGMzWHlxSjZhZGhBd3J3cFlpUWhxNDFyWUJqMmJxaktpSlJ3CklKQjRUbkl2U1BidGJSb2tKRzRwVXhqdU9mWm1jb2owOTNhMzVhMGZzSFFFNEUzY0FoV3lOSU5rUjV0VFVFK2YKRUxNcTBGUzE5Z2hBUWx4Wkp3NlhVS2cwZHFhOHhwQWdubmdYYzU2bFd4QmtZcnNyMjN1ZVdTNGZ2NjN0YVh6dApPbFd3cWplMmNYN2FwSXZZRW1MTkcwTXFiTVRVcUU2Q05ycThpOHhjZzNGbFY1QmZueUwrNGxoMjVYNWZOYmd4CjEyS1NpNlNoQ1ZWSG9qdDZydU5qQ09zQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo='
                })
            },
        })
    ];

    for (name in entryPoints) {
        if (entryPoints[name].build) {
            entry[name] = entryPoints[name].path;
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
                    test: /\.scss$/,
                    exclude: path.resolve('./src/app'),
                    loaders: ['style-loader', 'css-loader', 'sass-loader'],
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
                                'layout-body-background': '#fbfbfb'
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
    };

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

    return config;
};

fs.copySync('./src/favicon.ico', './build/public/favicon.ico');
fs.copySync('./src/settings.html', './build/public/settings.html');
fs.copySync('./src/source.html', './build/public/source.html');
fs.copySync('./src/landing.html', './build/public/index.html');
fs.copySync('./src/assets', './build/public/assets');
