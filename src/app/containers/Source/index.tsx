// tslint:disable: max-line-length

import * as React from 'react';
import { INotification } from '../../redux/modules/notifications';
import { ISettingsAction, getSettings, ISettingsRequest, ISettings, receiveSettings } from '../../redux/modules/settings';
import { connect } from 'react-redux';
import { IStore } from '../../redux/IStore';
import { Dispatch } from 'redux';
import { getConfigs, IConfigsRequest } from '../../redux/modules/configs';
import Websocket from '../../lib/Websocket';
import { IEnv } from '../../redux/modules/env';

const style = require('./style.scss');

interface IState {
  notifications: INotification[];
  display: boolean;
}

interface IProps {
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  env: IEnv;
  dispatch: Dispatch;
}

class SourceC extends React.Component<IProps, IState> {
  private interval: any;
  private sound: any;
  private websocket: Websocket;

  constructor(props: IProps) {
    super(props);

    this.state = {
      notifications: [],
      display: false
    };

    this.sound = new Audio('assets/audio/default.mp3');

    this.websocket = new Websocket(props.env.WS_API_GATEWAY, this.onMessage);
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    // todo: receive settings
    this.websocket.connect();
    window.Streamlabs.onMessage((event: MessageEvent) => {
      const message = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;

      switch (event.type) {
        case 'replay':
          this.onMessage(event);
          break;
        case 'testNotification':
          this.onMessage(event);
          break;
        case 'settings':
          receiveSettings(dispatch, message);
          break;
        default:
      }
    });

    try {
      await getConfigs(dispatch);
      const settings = await getSettings(dispatch) as ISettings;
      this.sound.src = `${(settings.notificationAudioUrl) ? settings.notificationAudioUrl : 'assets/audio/default.mp3'}`;
    } catch (e) {
      setTimeout(() => {
        location.reload();
      }, 10000);
    }
  }

  public componentWillUnmount() {
    this.websocket.disconnect();
  }

  private onMessage = (event: MessageEvent) => {
    const { configs } = this.props;
    const message = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;

    if (message.streamer.toLowerCase() !== configs.data.profiles.streamlabs.name.toLowerCase()) { return; }

    this.setState((prevState: IState) => {
      const newNotifications: INotification[] = [...prevState.notifications];
      newNotifications.push(message);

      if (!prevState.notifications.length) {
        this.interval = setInterval(this.shiftRequest, 10000);
        this.showRequest();
      }

      return {
        notifications: newNotifications
      };
    });
  }

  private showRequest = () => {
    const { settings } = this.props;

    setTimeout(() => {
      if (settings.data.playSound) {
        this.sound.play();
      }

      this.setState(() => {
        return { display: true };
      });
    }, 2000);

    setTimeout(() => {
      this.setState(() => {
        return { display: false };
      });
    }, 8000);
  }

  public shiftRequest = () => {
    this.setState((prevState: IState) => {
      const newNotifications: INotification[] = [...prevState.notifications];
      newNotifications.shift();

      if (!newNotifications.length) {
        clearInterval(this.interval);
      }

      if (newNotifications.length) {
        this.showRequest();
      }

      return {
        notifications: newNotifications
      };
    });
  }

  public render() {
    const { settings } = this.props;

    return (
      <div className={style.source}>
        <div className={(this.state.display) ? style.sourceMessage : `${style.sourceMessage} ${style.sourceHide}`}>
          {!!this.state.notifications.length && settings.data.showImage && <img src={`${(settings.data.notificationImageUrl) ? settings.data.notificationImageUrl : 'assets/images/default.png'}`} />}
          {!!this.state.notifications.length &&
            <div>
              Thank you <span className={style.sourceName}>{this.state.notifications[0].username}</span> for requesting <span className={style.sourceName}>{this.state.notifications[0].request}</span> for <span className={style.sourcePrice}>{this.state.notifications[0].amount}$</span> {(this.state.notifications[0].message) ? `Message: ${this.state.notifications[0].message}` : ''}
            </div>}
        </div>
      </div>
    );
  }
}

export const Source = connect(
  (state: IStore) => {
    return {
      settings: state.settings,
      configs: state.configs,
      env: state.env
     };
  },
  (d: Dispatch<ISettingsAction>) => ({ dispatch: d })
)(SourceC as any);
