import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { INotificationsRequest, INotificationsAction, getNotifications, INotification, addNotification } from '../../redux/modules/notifications';
import { IStore } from '../../redux/IStore';
import Layout from 'antd/lib/layout';
import Table from 'antd/lib/table';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Highlighter from 'react-highlight-words';
import { Spinner } from '../../components';
import _ from 'lodash';
import moment = require('moment');
import numeral = require('numeral');
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Websocket from '../../lib/Websocket';
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
  request: string;
  message: string;
  amount: number;
  amountString: string;
  username: string;
  timestamp: number;
  date: string;
  replay?: React.ReactElement<any>;
  key: number;
}

class NotificationsC extends React.Component<IProps, IState> {
  private onReplay: (index: number) => () => void;
  private bindDataTransformer: () => (data: INotification, index: number) => INotificationTransformed;
  private onHandleSearch: (selectedKeys: string[], confirm: () => {}) =>
    (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => void;
  private onHandleReset: (clearFilters: () => void) => () =>  void;
  private onSetSelectedKeys = (setSelectedKeys: (event: any[]) => void) => (e: any) => setSelectedKeys(e);
  private searchInput: Input | null;
  private websocket: Websocket;

  constructor(props: IProps) {
    super(props);

    this.onReplay = (index: number) => this.replay.bind(this, index);
    this.bindDataTransformer = () => this.dataTransformer.bind(this);
    this.onHandleSearch = (selectedKeys: string[], confirm: () => {}) => this.handleSearch.bind(this, selectedKeys, confirm);
    this.onHandleReset = (clearFilters: () => void) => () => this.handleReset(clearFilters);
    this.onSetSelectedKeys = (setSelectedKeys: (event: any[]) => void) => (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : []);
    this.searchInput = null;
    this.state = {
      searchText: ''
    };

    this.websocket = new Websocket(props.env.WS_API_GATEWAY, this.onMessage);
  }

  public componentDidMount() {
    const { dispatch } = this.props;

    getNotifications(dispatch);
    this.websocket.connect();
  }

  public componentWillUnmount() {
    this.websocket.disconnect();
  }

  private onMessage = (evt: MessageEvent) => {
    const { dispatch, configs } = this.props;
    const message = (typeof evt.data === 'string') ? JSON.parse(evt.data) : evt.data;

    if (message.streamer.toLowerCase() !== configs.data.profiles.streamlabs.name.toLowerCase()) { return; }

    addNotification(dispatch, message);
  }

  private getColumnSearchProps(dataIndex: string) {
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
            onPressEnter={this.onHandleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={this.onHandleSearch(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={this.onHandleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
        </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value: string, record: any) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
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
          textToHighlight={(text) ? text.toString() : ''}
        />
      ),
    };
  }

  private handleSearch(selectedKeys: string[], confirm: () => {}) {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  private handleReset(clearFilters: () => void) {
    clearFilters();
    this.setState({ searchText: '' });
  }

  private getColumns() {
    const columns: IColumn[] = [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.username.localeCompare(b.username)),
        ...this.getColumnSearchProps('username'),
      },
      {
        title: 'Request',
        dataIndex: 'request',
        key: 'request',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.request.localeCompare(b.request)),
        ...this.getColumnSearchProps('request'),
      },
      {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.message.localeCompare(b.message)),
        ...this.getColumnSearchProps('message'),
      },
      {
        title: 'Amount',
        dataIndex: 'amountString',
        key: 'amount',
        sorter: (a: INotificationTransformed, b: INotificationTransformed) => (a.amount - b.amount),
        ...this.getColumnSearchProps('amountString'),
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

  private async replay(index: number) {
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

  private dataTransformer(data: INotification, index: number) {
    return {
      ...data,
      date: moment(data.timestamp).fromNow(),
      amountString: numeral(data.amount).format('0.00$'),
      replay: <Icon onClick={this.onReplay(index)} type="redo" style={{ color: '#108ee9' }} />,
      key: index
    };
  }

  public render() {
    const { notifications } = this.props;

    return (
      <Content className={style.notifications}>
        <Card className={style.notificationsCard}>
          {notifications.isFetching && <Spinner />}
          {notifications.error && <h2>Error loading notifications</h2>}
          {!notifications.isFetching && !notifications.error && <div>
            <h1>Feed</h1>
            <p>Content homie</p>
            <Table className={style.notificationsTable} dataSource={notifications.data.map(this.bindDataTransformer())} columns={this.getColumns()} />;
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
