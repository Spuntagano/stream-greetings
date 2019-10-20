import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';
import { IStore } from './IStore';
import { settingsReducer } from './modules/settings';
import { configsReducer } from './modules/configs';
import { infosReducer } from './modules/infos';
import { chattersReducer } from './modules/chatters';

const rootReducer: Reducer<IStore> = combineReducers<IStore>({
  router: routerReducer,
  settings: settingsReducer,
  configs: configsReducer,
  infos: infosReducer,
  chatters: chattersReducer
});

export default rootReducer;
