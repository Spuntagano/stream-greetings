import { RouterState } from 'react-router-redux';
import { ISettingsRequest } from './modules/settings';
import { IRequestsRequest } from './modules/requests';
import { INotificationsRequest } from './modules/notifications';
import { IConfigsRequest } from './modules/configs';
import { IInfosRequest } from './modules/infos';
import { IChattersRequest } from './modules/chatters';
import { IEnv } from './modules/env';

export interface IStore {
  router: RouterState;
  settings: ISettingsRequest;
  requests: IRequestsRequest;
  notifications: INotificationsRequest;
  configs: IConfigsRequest;
  infos: IInfosRequest;
  chatters: IChattersRequest;
  env: IEnv;
}
