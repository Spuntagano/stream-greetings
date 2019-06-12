const appConfig = require('../../../config/main');
import { createStore, applyMiddleware, compose, Action, Store, Middleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from './reducers';
import { IStore } from './IStore';
import { History } from 'history';

export function configureStore(history: History, initialState?: IStore): Store<IStore> {
  const middlewares: Middleware[] = [routerMiddleware(history)];

  const composeEnhancers =
    (appConfig.env !== 'production' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const store: Store<IStore> = createStore<IStore, Action<any>, {}, {}>(
    rootReducer,
    initialState ? initialState : {},
    composeEnhancers(applyMiddleware(...middlewares))
  );

  if ((module as any).hot) {
    (module as any).hot.accept('./reducers', () => {
      store.replaceReducer(require('./reducers'));
    });
  }

  return store;
}
