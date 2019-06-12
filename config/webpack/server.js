var path = require('path');
var fs = require('fs-extra');
var webpack = require('webpack');
var postcssAssets = require('postcss-assets');
var postcssNext = require('postcss-cssnext');
var stylelint = require('stylelint');
require('dotenv').config();

var nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var config = {
  externals: nodeModules,
  mode: 'development',
  target: 'node',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve(__dirname), 'node_modules', 'app', 'app/redux'],
  },

  entry: './src/server.tsx',

  output: {
    path: path.resolve('./build/public'),
    filename: '../server.js',
    publicPath: '/public/',
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'url-loader?limit=1000&name=images/[hash].[ext]',
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
      {
        test: /\.scss$/,
        loaders: [
          'isomorphic-style-loader',
          'css-loader?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]',
          'sass-loader'
        ],
      },
      {
        test: /\.less$/,
        loaders: [{
          loader: 'isomorphic-style-loader'
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
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: false,
      options: {
        postcss: function() {
          return [
            postcssNext(),
            postcssAssets({
              relative: true,
            }),
          ];
        },
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        STAGING: JSON.stringify({
          SL_API_GATEWAY_URL: 'https://s21l2mphpd.execute-api.us-east-1.amazonaws.com/staging/',
          PAYPAL_API_GATEWAY_URL: 'https://ur1j3acuch.execute-api.us-east-1.amazonaws.com/LATEST/',
          PAYPAL_PAYMENT_URL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
          WS_API_GATEWAY: 'wss://lz48ofxhme.execute-api.us-east-1.amazonaws.com/staging',
          PUB_KEY: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFtR2NCd1JsMjZhUFIwcUN5NWJTNwo0SWxvTW5RWmhPWFZEWW9MRmk0QXJFY3BsR0VaMW9sK3QzNExFajhLenozbTJ6d0JNOEtTdlpDNGhCdklYRlRpCnpJdXpWNGVxVWlJaGZiSnB5NkFFSzBKZVVXSGM2SWlGenphVnVxQTUvQ3Z1aGJINUptSThzTXRNbE1SeFNGdk8KTVowMGoySDNwQUtOZ094NkNaQVpPck05ZC9LcmM5OU9GZnJIU2s2aWowcXU5bWVwdERPMWJ0RXhGZVVVZFBVOApySWRIcHl1YnU5NzNIdmF3dG1mYThWenhQaVE1Z0ptRSt4NlZmdFRPK0FFWG9kUTFtUlZzZTQ5R09IRWViMEtGCjM4SVVCSExqck9hQ2hLU04xVnN4UEcyRlZ3akpISFhVQUpJRm9ZNVBCWlM5SzdxN1JsQ1dxZkVDRy9YT3BxT3kKZkVFTSt5bWdIYmEwVCszVU9RMmZWandocytFeThjVDhJTkRxd3dNWjkzYjIrZU56dE9qTUZCeE81dHBTcEVsSwpZM2ZNNEk5bGgrKzdFbm9xdlJQSWM0dVU2QzFFUGMzWHlxSjZhZGhBd3J3cFlpUWhxNDFyWUJqMmJxaktpSlJ3CklKQjRUbkl2U1BidGJSb2tKRzRwVXhqdU9mWm1jb2owOTNhMzVhMGZzSFFFNEUzY0FoV3lOSU5rUjV0VFVFK2YKRUxNcTBGUzE5Z2hBUWx4Wkp3NlhVS2cwZHFhOHhwQWdubmdYYzU2bFd4QmtZcnNyMjN1ZVdTNGZ2NjN0YVh6dApPbFd3cWplMmNYN2FwSXZZRW1MTkcwTXFiTVRVcUU2Q05ycThpOHhjZzNGbFY1QmZueUwrNGxoMjVYNWZOYmd4CjEyS1NpNlNoQ1ZWSG9qdDZydU5qQ09zQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo='
        })
      },
    }),
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
};

fs.copySync('./src/favicon.ico', './build/public/favicon.ico');
fs.copySync('./src/settings.html', './build/public/settings.html');
fs.copySync('./src/source.html', './build/public/source.html');
fs.copySync('./src/landing.html', './build/public/index.html')
fs.copySync('./src/assets', './build/public/assets');


module.exports = config;
