import { RouterState } from 'react-router-redux';
import { ISettingsRequest } from './modules/settings';
import { IConfigsRequest } from './modules/configs';
import { IChattersRequest } from './modules/chatters';
import { IHintsRequest } from './modules/hints';

export interface IStore {
  router: RouterState;
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  chatters: IChattersRequest;
  hints: IHintsRequest;
}
