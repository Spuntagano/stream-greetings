import 'babel-polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
const { browserHistory } = require('react-router');
import { Landing } from './app/containers/Landing';
import { HashRouter } from 'react-router-dom';

import { configureStore } from './app/redux/store';

const store = configureStore(browserHistory, window.__INITIAL_STATE__);

const entry = (
  <Provider store={store} key="provider">
    <HashRouter>
      <Landing />
    </HashRouter>
  </Provider>
);

const entryNode = document.getElementById('app');

if (!entryNode) {
  throw Error('Could not find entry dom node: ' + entryNode);
}

ReactDOM.render(entry, entryNode);

if ((module as any).hot) {
  (module as any).hot.accept();

  (module as any).hot.accept('./app/routes', () => {
    ReactDOM.unmountComponentAtNode(entryNode);
    ReactDOM.render(
      <Provider store={store}>
        <HashRouter>
          <Landing />
        </HashRouter>
      </Provider>,
      entryNode
    );
  });
}
