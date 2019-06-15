// tslint:disable: max-line-length

import * as React from 'react';
import { INotification } from '../../redux/modules/notifications';
import { ISettings } from '../../redux/modules/settings';

const style = require('./style.scss');

interface IProps {
  settings: ISettings;
  notification: INotification;
  display: boolean;
}

class NotificationC extends React.Component<IProps> {

  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const { settings, notification, display } = this.props;

    return (
      <div className={style.notification}>
        <div className={(display) ? style.sourceMessage : `${style.sourceMessage} ${style.sourceHide}`}>
          {notification && settings.showImage && <img src={`${(settings.notificationImageUrl) ? settings.notificationImageUrl : 'assets/images/default.png'}`} />}
          {notification &&
            <div>
              Thank you <span className={style.sourceName}>{notification.username}</span> for requesting <span className={style.sourceName}>{notification.request}</span> for <span className={style.sourcePrice}>{notification.amount}$</span> {(notification.message) ? `Message: ${notification.message}` : ''}
            </div>}
        </div>
      </div>
    );
  }
}

export const Notification = NotificationC as any;
