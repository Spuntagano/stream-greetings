// tslint:disable: max-line-length

import * as React from 'react';
import { INotification } from '../../redux/modules/notifications';
import { ISettings } from '../../redux/modules/settings';
import numeral from 'numeral';
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

  private encodeHTML(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
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
        <div className={(display) ? style.sourceMessage : `${style.sourceMessage} ${style.sourceHide}`} style={{
            fontSize: settings.fontSize,
            fontWeight: settings.fontWeight,
            lineHeight: settings.lineHeight,
            color: settings.primaryColor,
            fontFamily: settings.fontFamily
          }}>
          {notification && settings.showImage && <img src={`${(settings.notificationImageUrl) ? settings.notificationImageUrl : 'assets/images/default.png'}`} />}
          {notification && settings.messageTemplate &&
            <div dangerouslySetInnerHTML={{__html: this.encodeHTML(settings.messageTemplate)
              .replace('{username}', `<span style="color: ${settings.secondaryColor}">${this.encodeHTML(username)}</span>`)
              .replace('{request}', `<span style="color: ${settings.secondaryColor}">${this.encodeHTML(notification.request)}</span>`)
              .replace('{amount}', `<span style="color: ${settings.secondaryColor}">${this.encodeHTML(numeral(notification.amount).format('0.00$'))}</span>`)
              .replace('{message}', this.encodeHTML(message))}} />}
        </div>
      </div>
    );
  }
}

export const Notification = NotificationC as any;
