import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';
import { IStore } from './IStore';
import { settingsReducer } from './modules/settings';
import { configsReducer } from './modules/configs';
import { chattersReducer } from './modules/chatters';
import { hintsReducer } from './modules/hints';

const rootReducer: Reducer<IStore> = combineReducers<IStore>({
  router: routerReducer,
  settings: settingsReducer,
  configs: configsReducer,
  chatters: chattersReducer,
  hints: hintsReducer
});

export default rootReducer;
