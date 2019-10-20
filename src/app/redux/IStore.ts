import { RouterState } from 'react-router-redux';
import { ISettingsRequest } from './modules/settings';
import { IConfigsRequest } from './modules/configs';
import { IInfosRequest } from './modules/infos';
import { IChattersRequest } from './modules/chatters';

export interface IStore {
  router: RouterState;
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  infos: IInfosRequest;
  chatters: IChattersRequest;
}
