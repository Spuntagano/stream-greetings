// tslint:disable: max-line-length

import * as React from 'react';
import { INotification, setNotifications, INotificationsRequest, getNotifications } from '../../redux/modules/notifications';
import { ISettingsAction, getSettings, ISettingsRequest, ISettings, /* receiveSettings */ } from '../../redux/modules/settings';
import { connect } from 'react-redux';
import { IStore } from '../../redux/IStore';
import { Dispatch } from 'redux';
import { getConfigs, IConfigsRequest } from '../../redux/modules/configs';
import { IEnv } from '../../redux/modules/env';
import { Notification } from '../../components/Notification';
import { getChatters, getLiveChatters, setChatters, IChattersRequest, IChatters, IChatter } from '../../redux/modules/chatters';

const style = require('./style.scss');

interface IState {
  notifications: INotification[];
  display: boolean;
}

interface IProps {
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  chatters: IChattersRequest;
  notifications: INotificationsRequest;
  env: IEnv;
  dispatch: Dispatch;
}

interface IChatMessage {
  body: string;
  from: string;
  payload: any;
  platform: string;
  subscriber: false;
  tags: any;
  to: string;
  userType: string;
}

class SourceC extends React.Component<IProps, IState> {
  private liveChattersFetchInterval: any;
  private notificationInterval: any;
  private sound: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      notifications: [],
      display: false
    };

    this.sound = new Audio('assets/audio/default.mp3');
    this.liveChattersFetchInterval = null;
    this.notificationInterval = null;
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    // window.Streamlabs.onMessage((event: MessageEvent) => {
    //   const message = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;

    //   switch (event.type) {
    //     case 'replay':
    //       this.onMessage(event);
    //       break;
    //     case 'testNotification':
    //       this.onMessage(event);
    //       break;
    //     case 'settings':
    //       receiveSettings(dispatch, message);
    //       break;
    //     default:
    //   }
    // });

    try {
      const settings = await getSettings(dispatch) as ISettings;
      const configs = await getConfigs(dispatch);
      await getNotifications(dispatch);
      await getChatters(dispatch, configs.profiles.twitch.name);

      this.sound.src = `${(settings.notificationAudioUrl) ? settings.notificationAudioUrl : 'assets/audio/default.mp3'}`;
    } catch (e) {
      setTimeout(() => {
        location.reload();
      }, 10000);
    }

    window.Streamlabs.onChatMessage(this.onChatMessage);
    window.Streamlabs.twitch.initTwitchChat();

    this.fetchLiveChatters();
    this.liveChattersFetchInterval = setInterval(this.fetchLiveChatters, 60000);
  }

  public componentWillUnmount() {
    clearInterval(this.liveChattersFetchInterval);
    clearInterval(this.notificationInterval);
  }

  private fetchLiveChatters = async () => {
    const { dispatch, configs, chatters } = this.props;
    const newChatters = await getLiveChatters(dispatch, configs.data.profiles.twitch.name, chatters.data) as IChatters;
    setChatters(dispatch, configs.data.profiles.twitch.name, newChatters);

    Object.keys(newChatters).forEach((username) => {
      this.notify({
        type: 'JOIN',
        username,
        chatter: newChatters[username],
        timestamp: new Date().getTime()
      });
    });
  }

  private onChatMessage = (message: IChatMessage) => {
    const { chatters, configs, dispatch } = this.props;

    let chatter: IChatter = {
      firstJoinedTimestamp: ''
    };

    if (!chatters.data[message.from]) {
      chatter = {
        firstChatMessage: message.body,
        firstJoinedTimestamp: String(new Date().getTime()),
        firstChatMessageTimestamp: String(new Date().getTime())
      };
    } else if (!chatters.data[message.from].firstChatMessage) {
      chatter = {
        ...chatters.data[message.from],
        firstChatMessage: message.body,
        firstChatMessageTimestamp: String(new Date().getTime())
      };
    }

    if (chatter.firstJoinedTimestamp) {
      setChatters(dispatch, configs.data.profiles.twitch.name, {
        [message.from]: chatter
      });

      this.notify({
        type: 'MESSAGE',
        username: message.from,
        chatter,
        timestamp: new Date().getTime()
      });
    }
  }

  private notify = (notification: INotification) => {

    this.setState((prevState: IState) => {
      const newNotifications: INotification[] = [...prevState.notifications];
      newNotifications.push(notification);

      if (!prevState.notifications.length) {
        this.notificationInterval = setInterval(this.shiftRequest, 10000);
        this.showNotification();
      }

      return {
        notifications: newNotifications
      };
    });
  }

  private showNotification = () => {
    const { settings, dispatch, notifications } = this.props;

    setTimeout(() => {
      window.Streamlabs.postMessage('NOTIFICATION', this.state.notifications[0]);
      setNotifications(dispatch, [
        this.state.notifications[0],
        ...notifications.data
      ]);

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
        clearInterval(this.notificationInterval);
      }

      if (newNotifications.length) {
        this.showNotification();
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
        <Notification notification={this.state.notifications[0]} settings={settings.data} display={this.state.display} />
      </div>
    );
  }
}

export const Source = connect(
  (state: IStore) => {
    return {
      settings: state.settings,
      configs: state.configs,
      chatters: state.chatters,
      notifications: state.notifications,
      env: state.env
     };
  },
  (d: Dispatch<ISettingsAction>) => ({ dispatch: d })
)(SourceC as any);
