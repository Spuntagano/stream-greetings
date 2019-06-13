import 'babel-polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';
const { browserHistory } = require('react-router');

import { routes } from './app/routes';

import { configureStore } from './app/redux/store';

const store = configureStore(browserHistory, window.__INITIAL_STATE__);

const entry = (
  <Provider store={store} key="provider">
    <HashRouter>
      {renderRoutes(routes)}
    </HashRouter>
  </Provider>
);

const entryNode = document.getElementById('app');

if (!entryNode) {
  throw Error('Could not find entry dom node: ' + entryNode);
}

ReactDOM.hydrate(entry, entryNode);
