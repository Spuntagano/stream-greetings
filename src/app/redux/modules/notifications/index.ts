import { IChatter } from '../chatters';

export interface INotification {
  type: string;
  username: string;
  chatter: IChatter;
  timestamp: number;
}
