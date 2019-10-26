import 'babel-polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
const { browserHistory } = require('react-router');
import { Source } from './app/containers/Source/Source';

import { configureStore } from './app/redux/store';

const store = configureStore(browserHistory, window.__INITIAL_STATE__);

const entry = (
  <Provider store={store} key="provider">
    <Source />
  </Provider>
);

const entryNode = document.getElementById('app');

if (!entryNode) {
  throw Error('Could not find entry dom node: ' + entryNode);
}

ReactDOM.render(entry, entryNode);
