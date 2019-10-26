import { RouterState } from 'react-router-redux';
import { ISettingsRequest } from './modules/settings/settings';
import { IConfigsRequest } from './modules/configs/configs';
import { IChattersRequest } from './modules/chatters/chatters';
import { IHintsRequest } from './modules/hints/hints';

export interface IStore {
  router: RouterState;
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  chatters: IChattersRequest;
  hints: IHintsRequest;
}
