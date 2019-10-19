// tslint:disable: max-line-length

import * as React from 'react';
import { INotification, INotificationsRequest, getNotifications } from '../../redux/modules/notifications';
import { ISettingsAction, getSettings, receiveSettings, ISettingsRequest, ISettings } from '../../redux/modules/settings';
import { connect } from 'react-redux';
import { IStore } from '../../redux/IStore';
import { Dispatch } from 'redux';
import { getConfigs, IConfigsRequest } from '../../redux/modules/configs';
import { IEnv } from '../../redux/modules/env';
import { Notification } from '../../components/Notification';
import { getChatters, getLiveChatters, setChatter, IChattersRequest, IChatters, IChatter } from '../../redux/modules/chatters';

const style = require('./style.scss');

interface IState {
  notifications: INotification[];
  display: boolean;
  notificationsPostQueue: INotification[];
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
  private notificationsPostInterval: any;
  private sound: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      notifications: [],
      display: false,
      notificationsPostQueue: []
    };

    this.sound = new Audio('assets/audio/default.mp3');
    this.liveChattersFetchInterval = null;
    this.notificationInterval = null;
    this.notificationsPostInterval = null;
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    window.Streamlabs.onMessage((event: MessageEvent) => {
      switch (event.type) {
        case 'REPLAY':
          this.notify(event.data);
          break;
        case 'TEST_NOTIFICATION':
          this.notify(event.data);
          break;
        case 'SETTINGS':
          receiveSettings(dispatch, event.data);
          break;
        default:
      }
    });

    try {
      const settings = await getSettings(dispatch) as ISettings;
      const configs = await getConfigs(dispatch);
      await getChatters(dispatch, configs.profiles.twitch.name);
      await getNotifications(dispatch);
      this.fetchLiveChatters();
      window.Streamlabs.onChatMessage(this.onChatMessage);
      window.Streamlabs.twitch.initTwitchChat();
      this.liveChattersFetchInterval = setInterval(this.fetchLiveChatters, 60000);
      this.notificationsPostInterval = setInterval(this.postChatters, 5000);

      this.sound.src = `${(settings.notificationAudioUrl) ? settings.notificationAudioUrl : 'assets/audio/default.mp3'}`;
    } catch (e) {
      setTimeout(() => {
        location.reload();
      }, 10000);
    }
  }

  public componentWillUnmount() {
    clearInterval(this.liveChattersFetchInterval);
    clearInterval(this.notificationInterval);
    clearInterval(this.notificationsPostInterval);
  }

  private postChatters = () => {
    window.Streamlabs.postMessage('NOTIFICATIONS', this.state.notificationsPostQueue);
    this.setState({
      notificationsPostQueue: []
    });
  }

  private fetchLiveChatters = async () => {
    const { dispatch, configs, chatters } = this.props;
    const newChatters = await getLiveChatters(dispatch, configs.data.profiles.twitch.name, chatters.data) as IChatters;
    const usernames = Object.keys(newChatters);
    usernames.length = 300;
    usernames.forEach((username, index) => {
      setTimeout(() => {
        const notification = {
          type: 'JOIN',
          username,
          chatter: newChatters[username],
          timestamp: new Date().getTime()
        };

        this.setState((prevState: IState) => ({
          notificationsPostQueue: [
            ...prevState.notificationsPostQueue,
            notification
          ]
        }));

        this.notify(notification);
        setChatter(dispatch, configs.data.profiles.twitch.name, newChatters, username);
      }, 200 * index);
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
    } else {
      return;
    }

    setChatter(dispatch, configs.data.profiles.twitch.name, {
      [message.from]: chatter
    }, message.from);

    const notification = {
      type: 'MESSAGE',
      username: message.from,
      chatter,
      timestamp: new Date().getTime()
    };

    this.setState((prevState: IState) => ({
      notificationsPostQueue: [
        ...prevState.notificationsPostQueue,
        notification
      ]
    }));
    this.notify(notification);
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
