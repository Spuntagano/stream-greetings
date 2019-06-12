import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';
import { IStore } from './IStore';
import { settingsReducer } from './modules/settings';
import { requestsReducer } from './modules/requests';
import { notificationsReducer } from './modules/notifications';
import { configsReducer } from './modules/configs';
import { infosReducer } from './modules/infos';
import { envReducer } from './modules/env';

const rootReducer: Reducer<IStore> = combineReducers<IStore>({
  router: routerReducer,
  settings: settingsReducer,
  requests: requestsReducer,
  notifications: notificationsReducer,
  configs: configsReducer,
  infos: infosReducer,
  env: envReducer
});

export default rootReducer;
