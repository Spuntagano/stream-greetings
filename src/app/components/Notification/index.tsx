// tslint:disable: max-line-length

import * as React from 'react';
import { INotification } from '../../redux/modules/notifications';
import { ISettings } from '../../redux/modules/settings';
import { CensorSensor } from 'censor-sensor';

const style = require('./style.scss');

interface IProps {
  settings: ISettings;
  notification: INotification;
  display: boolean;
}

class NotificationC extends React.Component<IProps> {
  private censor: CensorSensor;

  constructor(props: IProps) {
    super(props);

    this.censor = new CensorSensor();
    this.censor.enableTier(1);
  }

  public render() {
    const { settings, notification, display } = this.props;

    let username = '';
    let message = '';
    if (notification) {
      username = notification.username;
      message = notification.message;

      if (settings.profanityFilter) {
        username = this.censor.cleanProfanity(username);
        message = this.censor.cleanProfanity(message);
      }
    }

    return (
      <div className={style.notification}>
        <div className={(display) ? style.sourceMessage : `${style.sourceMessage} ${style.sourceHide}`}>
          {notification && settings.showImage && <img src={`${(settings.notificationImageUrl) ? settings.notificationImageUrl : 'assets/images/default.png'}`} />}
          {notification &&
            <div>
              Thank you <span className={style.sourceName}>{username}</span> for requesting <span className={style.sourceName}>{notification.request}</span> for <span className={style.sourcePrice}>{notification.amount}$</span> {(message) ? `Message: ${message}` : ''}
            </div>}
        </div>
      </div>
    );
  }
}

export const Notification = NotificationC as any;
