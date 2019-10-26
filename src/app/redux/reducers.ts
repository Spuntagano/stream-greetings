import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';
import { IStore } from './IStore';
import { settingsReducer } from './modules/settings/settings';
import { configsReducer } from './modules/configs/configs';
import { chattersReducer } from './modules/chatters/chatters';
import { hintsReducer } from './modules/hints/hints';

const rootReducer: Reducer<IStore> = combineReducers<IStore>({
  router: routerReducer,
  settings: settingsReducer,
  configs: configsReducer,
  chatters: chattersReducer,
  hints: hintsReducer
});

export default rootReducer;
