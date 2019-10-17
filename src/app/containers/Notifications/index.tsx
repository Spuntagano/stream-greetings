import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { INotificationsRequest, INotificationsAction, getNotifications, INotification, addNotification, deleteNotifications } from '../../redux/modules/notifications';
import { IStore } from '../../redux/IStore';
import Layout from 'antd/lib/layout';
import Table from 'antd/lib/table';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Highlighter from 'react-highlight-words';
import { Spinner } from '../../components';
import _ from 'lodash';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import { IConfigsRequest } from '../../redux/modules/configs';
import { IEnv } from '../../redux/modules/env';

const { Content } = Layout;
const style = require('./style.scss');

interface IProps {
  notifications: INotificationsRequest;
  configs: IConfigsRequest;
  dispatch: Dispatch;
  form: any;
  env: IEnv;
}

interface IState {
  searchText: string;
}

interface IFilter {
  selectedKeys: string[];
  setSelectedKeys: (event: any[]) => void;
  confirm: () => {};
  clearFilters: () => {};
}

interface IColumn {
  title: string;
  dataIndex: string;
  key: string;
  sorter?: (a: INotificationTransformed, b: INotificationTransformed) => number;
  className?: string;
}

interface INotificationTransformed {
  type: string;
  message: string;
  username: string;
  timestamp: number;
  date: string;
  replay?: React.ReactElement<any>;
  key: number;
}

class NotificationsC extends React.Component<IProps, IState> {
  private searchInput: Input | null;
  constructor(props: IProps) {
    super(props);

    this.searchInput = null;
    this.state = {
      searchText: ''
    };
  }

  public componentDidMount() {
    const { dispatch } = this.props;

    getNotifications(dispatch);
    window.Streamlabs.onMessage(this.onMessage);
  }

  private onMessage = (event: MessageEvent) => {
    const { dispatch } = this.props;

    if (event.type === 'NOTIFICATION') {
      addNotification(dispatch, event.data);
    }
  }

  private getColumnSearchProps = (dataIndex: string) => {
    return {
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: IFilter) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={this.onSetSelectedKeys(setSelectedKeys)}
            onPressEnter={this.handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={this.handleSearch(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value: string, record: any) => (
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => this.searchInput && this.searchInput.select());
        }
      },
      render: (text: string) => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape={true}
          textToHighlight={(text || '').toString()}
        />
      )
    };
  }

  private handleSearch = (selectedKeys: string[], confirm: () => void) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  private onSetSelectedKeys = (setSelectedKeys: (event: any[]) => void) => (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : []);

  private handleReset = (clearFilters: () => void) => () => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  private getColumns = () => {
    const columns: IColumn[] = [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.type.localeCompare(b.type)),
        ...this.getColumnSearchProps('type'),
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.username.localeCompare(b.username)),
        ...this.getColumnSearchProps('username'),
      },
      {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.message.localeCompare(b.message)),
        ...this.getColumnSearchProps('message'),
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (b.timestamp - a.timestamp)
      },
      {
        title: 'Replay',
        dataIndex: 'replay',
        key: 'replay',
        className: style.notificationsReplay
      }
    ];

    return columns;
  }

  private replay = (index: number) => async () => {
    const { notifications } = this.props;

    try {
      await window.Streamlabs.postMessage('replay', notifications.data[index]);
      notification.open({
        message: 'Notification replay sent',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      });
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
      });
    }
  }

  private dataTransformer = (data: INotification, index: number) => {
    return {
      ...data,
      message: (data.chatter && data.chatter.firstChatMessage) ? data.chatter.firstChatMessage : '',
      date: moment(data.timestamp).fromNow(),
      replay: <Icon onClick={this.replay(index)} type="redo" style={{ color: '#108ee9' }} />,
      key: index
    };
  }

  private clearNotification = () => {
    const { dispatch } = this.props;
    deleteNotifications(dispatch);
  }

  public render() {
    const { notifications } = this.props;

    return (
      <Content className={style.notifications}>
        <Card className={style.notificationsCard}>
          {notifications.isFetching && <Spinner />}
          {notifications.error && <h2>Error loading notifications</h2>}
          {!notifications.isFetching && !notifications.error && <div>
            <div className={style.titleContainer}>
              <h1 className={style.title}>Feed</h1>
              <Button className={style.clearNotificationButton} type="default" onClick={this.clearNotification}>Clear notifications</Button>
            </div>
            <Table className={style.notificationsTable} dataSource={notifications.data.map(this.dataTransformer)} columns={this.getColumns()} />;
          </div>}
        </Card>
      </Content>
    );
  }
}
export const Notifications = connect(
  (state: IStore) => {
    return {
      notifications: state.notifications,
      configs: state.configs,
      env: state.env
    };
  },
  (d: Dispatch<INotificationsAction>) => ({ dispatch: d })
)(NotificationsC as any);
