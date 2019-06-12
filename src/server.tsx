import 'babel-polyfill';

import appConfig from '../config/main';

import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import { matchRoutes, renderRoutes } from 'react-router-config';
import { configureStore } from './app/redux/store';
import { routes } from './app/routes';
import { createMemoryHistory } from 'history';

import { Html } from './app/containers';
const manifest = require('../build/manifest.json');
import express from 'express';
import path from 'path';
import compression from 'compression';
import Chalk from 'chalk';
import favicon from 'serve-favicon';
import http from 'http';
import https from 'https';
import fs from 'fs';

const app = express();

app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackConfig = require('../config/webpack/dev');
  const webpackCompiler = webpack(webpackConfig);

  app.use(
    require('webpack-dev-middleware')(webpackCompiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: { colors: true },
      noInfo: true,
      hot: true,
      inline: true,
      lazy: false,
      historyApiFallback: true,
      quiet: true,
    })
  );

  app.use(require('webpack-hot-middleware')(webpackCompiler));
}

app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

app.use('/public', express.static(path.join(__dirname, 'public')));

const store = configureStore(createMemoryHistory());

app.get('*', async (req, res) => {
  const branch = matchRoutes(routes, req.url);
  const promises = branch.map(({ route, match }) => {
    const fetchData = (route.component as any).fetchData;
    return fetchData instanceof Function ? fetchData(store, match) : Promise.resolve(null);
  });

  await Promise.all(promises);
  const context = {} as any;
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        {renderRoutes(routes)}
      </StaticRouter>
    </Provider>
  );
  const page = renderHTML(content, store);
  if (context.status === 404) {
    res.status(404);
  }
  if (context.status === 302) {
    return res.redirect(302, context.url);
  }
  res.status(200).send(page);
});

if (appConfig.httpPort) {
  http.createServer(app).listen(appConfig.httpPort, (err: Error) => {
    if (err) {
      console.error(Chalk.bgRed(String(err)));
    } else {
      console.info(Chalk.black.bgGreen(`\n\n💂  http listening on port: ${appConfig.httpPort}\n`));
    }
  });
}

if (appConfig.httpsPort) {
  const credentials = {
    key: fs.readFileSync('cert/privkey.pem').toString(),
    cert: fs.readFileSync('cert/fullchain.pem').toString()
  };

  https.createServer(credentials, app).listen(appConfig.httpsPort, (err: Error) => {
    if (err) {
      console.error(Chalk.bgRed(String(err)));
    } else {
      console.info(Chalk.black.bgGreen(`\n\n💂  https listening on port: ${appConfig.httpsPort}\n`));
    }
  });
}

function renderHTML(markup: string, store: any) {
  const html = renderToString(<Html markup={markup} manifest={manifest} store={store} />);

  return `<!doctype html> ${html}`;
}
