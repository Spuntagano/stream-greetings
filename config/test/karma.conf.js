var path = require('path');
var webpack = require('webpack');
var postcssAssets = require('postcss-assets');
var postcssNext = require('postcss-cssnext');
var appConfig = require('../main');
var stylelint = require('stylelint');

module.exports = function (config) {
  const conf = {
    frameworks: ['mocha', 'chai', 'es6-shim'],

    browsers: ['PhantomJS'],

    files: ['../webpack/test.js'],

    preprocessors: {
      '../src/**/*.ts': ['sourcemap'],
      '../src/**/*.tsx': ['sourcemap'],
      '../webpack/test.js': ['webpack'],
    },

    plugins: ['karma-*'],

    reporters: ['mocha', 'coverage-istanbul'],

    coverageIstanbulReporter: {
      reports: ['text-summary'],
      fixWebpackSourcePaths: true,
      dir: 'coverage',
      'report-config': {
        html: {
          subdir: 'html',
        },
        lcov: {
          subdir: 'lcov',
        },
      },
    },

    hostname: appConfig.host,

    port: appConfig.karmaPort,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    singleRun: false,

    concurrency: Infinity,

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',

      resolve: {
        modules: [path.resolve(__dirname), '../../src', '../../src/app', '../../src/app/redux', 'node_modules'],
        extensions: ['.json', '.js', '.ts', '.tsx', '.jsx'],
      },

      module: {
        rules: [
          {
            enforce: 'pre',
            test: /\.tsx?$/,
            loader: 'tslint-loader',
          },
          {
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader?useCache=false',
          },
          {
            test: /\.(jpe?g|png|gif)$/i,
            loader: 'url-loader?limit=1000&name=images/[hash].[ext]',
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
            loader: 'style-loader!css-loader!sass-loader',
          },
          {
            enforce: 'post',
            test: /\.tsx?$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true },
            },
            include: path.resolve('./src/app'),
            exclude: /node_modules|\.test\.tsx?$/,
          },
        ],
      },

      externals: {
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': 'window',
      },

      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            tslint: {
              failOnHint: true,
            },
            postcss: function () {
              return [
                postcssNext(),
                postcssAssets({
                  relative: true,
                }),
              ];
            },
          },
        }),
        new webpack.IgnorePlugin(/^fs$/),
        new webpack.IgnorePlugin(/^react\/addons$/),
        new webpack.NoEmitOnErrorsPlugin(),
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
              SL_API_GATEWAY_URL: 'https://s21l2mphpd.execute-api.us-east-1.amazonaws.com/staging/',
              PAYPAL_API_GATEWAY_URL: 'https://ur1j3acuch.execute-api.us-east-1.amazonaws.com/LATEST/',
              PAYPAL_PAYMENT_URL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
              WS_API_GATEWAY: 'wss://lz48ofxhme.execute-api.us-east-1.amazonaws.com/staging',
              PUB_KEY: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFtR2NCd1JsMjZhUFIwcUN5NWJTNwo0SWxvTW5RWmhPWFZEWW9MRmk0QXJFY3BsR0VaMW9sK3QzNExFajhLenozbTJ6d0JNOEtTdlpDNGhCdklYRlRpCnpJdXpWNGVxVWlJaGZiSnB5NkFFSzBKZVVXSGM2SWlGenphVnVxQTUvQ3Z1aGJINUptSThzTXRNbE1SeFNGdk8KTVowMGoySDNwQUtOZ094NkNaQVpPck05ZC9LcmM5OU9GZnJIU2s2aWowcXU5bWVwdERPMWJ0RXhGZVVVZFBVOApySWRIcHl1YnU5NzNIdmF3dG1mYThWenhQaVE1Z0ptRSt4NlZmdFRPK0FFWG9kUTFtUlZzZTQ5R09IRWViMEtGCjM4SVVCSExqck9hQ2hLU04xVnN4UEcyRlZ3akpISFhVQUpJRm9ZNVBCWlM5SzdxN1JsQ1dxZkVDRy9YT3BxT3kKZkVFTSt5bWdIYmEwVCszVU9RMmZWandocytFeThjVDhJTkRxd3dNWjkzYjIrZU56dE9qTUZCeE81dHBTcEVsSwpZM2ZNNEk5bGgrKzdFbm9xdlJQSWM0dVU2QzFFUGMzWHlxSjZhZGhBd3J3cFlpUWhxNDFyWUJqMmJxaktpSlJ3CklKQjRUbkl2U1BidGJSb2tKRzRwVXhqdU9mWm1jb2owOTNhMzVhMGZzSFFFNEUzY0FoV3lOSU5rUjV0VFVFK2YKRUxNcTBGUzE5Z2hBUWx4Wkp3NlhVS2cwZHFhOHhwQWdubmdYYzU2bFd4QmtZcnNyMjN1ZVdTNGZ2NjN0YVh6dApPbFd3cWplMmNYN2FwSXZZRW1MTkcwTXFiTVRVcUU2Q05ycThpOHhjZzNGbFY1QmZueUwrNGxoMjVYNWZOYmd4CjEyS1NpNlNoQ1ZWSG9qdDZydU5qQ09zQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo='
            })
          },
        })
      ],
    },

    webpackServer: {
      noInfo: true,
    },
  };

  if (process.env.NODE_ENV === 'ci') {
    conf.autoWatch = false;
    conf.singleRun = true;
    conf.browsers.push('Firefox');
    conf.coverageIstanbulReporter.reports.push('lcov');
  } else {
    conf.coverageIstanbulReporter.reports.push('html');
    conf.browsers.push('Chrome');
  }

  config.set(conf);
};
