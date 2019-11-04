import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import moment from 'moment'
import Select from 'antd/lib/select'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { IChattersRequest, IChattersAction, IChatters, getChatters, addChatters } from '../../redux/modules/chatters/chatters'
import { IStore } from '../../redux/IStore'
import Layout from 'antd/lib/layout'
import Table from 'antd/lib/table'
import Card from 'antd/lib/card'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import notification from 'antd/lib/notification'
import Col from 'antd/lib/col'
import Row from 'antd/lib/row'
import Highlighter from 'react-highlight-words'
import { Spinner } from '../../components'
import _ from 'lodash'
import Icon from 'antd/lib/icon'
import { IConfigsRequest } from '../../redux/modules/configs/configs'
import { INotification } from '../../redux/modules/notifications/notifications'
import { getSettings, ISettingsRequest } from '../../redux/modules/settings/settings'

const { Option } = Select
const { Content } = Layout
const style = require('./Chatters.scss')

interface IGraphSelect {
  label: string
  interval: number
  startTime: number
  endTime: number
  format: string
}

interface IProps {
  chatters: IChattersRequest
  configs: IConfigsRequest
  settings: ISettingsRequest
  dispatch: Dispatch
  form: IGraphSelect
}

interface IState {
  searchText: string,
  selectedTimeFrame: number,
  sourceLoaded: boolean
}

interface IFilter {
  selectedKeys: string[]
  setSelectedKeys: (event: any[]) => void
  confirm: () => {}
  clearFilters: () => {}
}

interface IColumn {
  title: string
  dataIndex: string
  key: string
  sorter?: (a: IChatterTransformed, b: IChatterTransformed) => number
  defaultSortOrder?: 'descend' | 'ascend' | undefined
  className?: string,
  width?: number
}

interface IChatterTransformed {
  username: string
  firstChatMessage: string
  latestActionTimestamp: string
  latestActionDate: string
  key: string
}

interface IEvents {
  [s: string]: string[]
}

const timeFrames: IGraphSelect[] = [{
  label: 'Today',
  interval: 60 * 60 * 1000,
  startTime: moment().startOf('day').valueOf(),
  endTime: moment().endOf('day').valueOf(),
  format: 'HH:mm'
},
{
  label: 'Yesterday',
  interval: 60 * 60 * 1000,
  startTime: moment().subtract(1, 'day').startOf('day').valueOf(),
  endTime: moment().subtract(1, 'day').endOf('day').valueOf(),
  format: 'HH:mm'
},
{
  label: 'This week',
  interval: 60 * 60 * 12 * 1000,
  startTime: moment().startOf('week').valueOf(),
  endTime: moment().endOf('week').valueOf(),
  format: 'D:MMM HH:'
},
{
  label: 'Last week',
  interval: 60 * 60 * 12 * 1000,
  startTime: moment().subtract(1, 'week').startOf('week').valueOf(),
  endTime: moment().subtract(1, 'week').endOf('week').valueOf(),
  format: 'D:MMM HH:mm'
},
{
  label: 'This month',
  interval: 60 * 60 * 24 * 1000,
  startTime: moment().startOf('month').valueOf(),
  endTime: moment().endOf('month').valueOf(),
  format: 'D:MMM'
},
{
  label: 'Last month',
  interval: 60 * 60 * 24 * 1000,
  startTime: moment().subtract(1, 'month').startOf('month').valueOf(),
  endTime: moment().subtract(1, 'month').endOf('month').valueOf(),
  format: 'D:MMM'
}]

class ChattersC extends React.Component<IProps, IState> {
  private searchInput: Input | null
  private streamlabsOBS: any
  private sourcesQueue: any[]

  constructor(props: IProps) {
    super(props)

    this.sourcesQueue = []
    this.streamlabsOBS = window.streamlabsOBS
    this.searchInput = null
    this.state = {
      searchText: '',
      selectedTimeFrame: 0,
      sourceLoaded: false,
    }
  }

  public componentWillMount() {
    const { dispatch, configs } = this.props

    try {
      getSettings(dispatch)
      getChatters(dispatch, configs.data.profiles.twitch.name)
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
        duration: 0
      })
    }

    window.Streamlabs.onMessage(this.onMessage)

    if (!this.streamlabsOBS) { return }
    this.streamlabsOBS.apiReady.then(() => {
      const events: IEvents = {
        Sources: ['sourceAdded', 'sourceRemoved', 'sourceUpdated'],
        Scenes: ['sceneAdded', 'sceneRemoved', 'sceneSwitched']
      }

      this.detectIfSourceIsInScene()
      Object.keys(events).forEach((key: string) => {
        events[key].forEach((event: string) => {
          this.streamlabsOBS.v1[key][event](this.detectIfSourceIsInScene)
        })
      })
    })
  }

  private detectIfSourceIsInScene = async () => {
    const scene = await this.streamlabsOBS.v1.Scenes.getActiveScene()
    const sources = await this.streamlabsOBS.v1.Sources.getAppSources()
    let sourceLoaded = false

    this.nodeCrawler(scene.nodes)
    this.sourcesQueue.forEach((node: any) => {
      sources.forEach((source: any) => {
        if (node.sourceId === source.id) {
          sourceLoaded = true
        }
      })
    })

    this.setState({ sourceLoaded })
    this.sourcesQueue = []
  }

  private async nodeCrawler(nodes: any[]) {
    nodes.forEach(async (node: any) => {
      if (node.type === 'folder') {
        this.nodeCrawler(node)
      } else if (node.type === 'scene_item') {
        this.sourcesQueue.push(node)
      }
    })
  }

  private onMessage = (event: MessageEvent) => {
    const { dispatch } = this.props

    if (event.type === 'NOTIFICATIONS') {
      const chatters: IChatters = {}
      event.data.forEach((notification: INotification) => {
        chatters[notification.username] = notification.chatter
      })

      addChatters(dispatch, chatters)
    }
  }

  private getColumnSearchProps = (dataIndex: string) => {
    return {
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }: IFilter) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node
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
          setTimeout(() => this.searchInput && this.searchInput.select())
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
    }
  }

  private handleSearch = (selectedKeys: string[], confirm: () => void) => () => {
    confirm()
    this.setState({ searchText: selectedKeys[0] })
  }

  private onSetSelectedKeys = (setSelectedKeys: (event: any[]) => void) => (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])

  private handleReset = (clearFilters: () => void) => () => {
    clearFilters()
    this.setState({ searchText: '' })
  }

  private getColumns = () => {
    const columns: IColumn[] = [
      {
        title: 'Date',
        dataIndex: 'latestActionDate',
        key: 'latestActionDate',
        sorter: (a: IChatterTransformed, b: IChatterTransformed) => (parseInt((b.latestActionTimestamp), 10) - parseInt((a.latestActionTimestamp), 10)),
        defaultSortOrder: 'ascend',
        width: 150
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        sorter: (a: IChatterTransformed, b: IChatterTransformed) => (a.username.localeCompare(b.username)),
        width: 200,
        ...this.getColumnSearchProps('username'),
      },
      {
        title: 'First chat message',
        dataIndex: 'firstChatMessage',
        key: 'firstChatMessage',
        sorter: (a: IChatterTransformed, b: IChatterTransformed) => (a.firstChatMessage).localeCompare(b.firstChatMessage),
      },
      {
        title: 'Replay',
        dataIndex: 'replay',
        key: 'replay',
        width: 100,
        className: style.chattersReplay
      }
    ]

    return columns
  }

  private replay = (username: string) => async () => {
    const { chatters } = this.props

    const notif: INotification = {
      username,
      chatter: chatters.data[username],
      timestamp: parseInt(chatters.data[username].firstChatMessageTimestamp || '', 10) || parseInt(chatters.data[username].firstJoinedTimestamp, 10),
      type: chatters.data[username].firstChatMessage ? 'MESSAGE' : 'JOIN'
    }

    try {
      await window.Streamlabs.postMessage('REPLAY', notif)
      notification.open({
        message: 'Notification replay sent',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      })
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
      })
    }
  }

  private tableDataTransformer = (username: string) => {
    const { chatters } = this.props

    return {
      username,
      firstChatMessage: chatters.data[username].firstChatMessage || '',
      latestActionTimestamp: chatters.data[username].firstChatMessageTimestamp || chatters.data[username].firstJoinedTimestamp,
      latestActionDate: moment(parseInt(chatters.data[username].firstChatMessageTimestamp || chatters.data[username].firstJoinedTimestamp, 10)).fromNow(),
      replay: <Icon onClick={this.replay(username)} type="redo" style={{ color: '#108ee9' }} />,
      key: username
    }
  }

  private groupDataBytimeFrame = (data: any[], prop: string, timeFrame: number, startTime: number, endTime: number) => {
    const sortedData = data.sort((a, b) => a[prop] - b[prop])
    const dataBytimeFrame: any = {}
    let currentTime = startTime
    let index = 0

    while (currentTime < endTime) {
      dataBytimeFrame[currentTime] = 0
      while (index < sortedData.length && sortedData[index][prop] < startTime) {
        index++
      }

      while (index < sortedData.length && sortedData[index][prop] < currentTime) {
        if (sortedData[index][prop]) {
          dataBytimeFrame[currentTime]++
        }

        index++
      }

      currentTime += timeFrame
    }

    return dataBytimeFrame
  }

  private chartDataTransformer = () => {
    const { chatters } = this.props

    const chattersArray = Object.keys(chatters.data).map((username: string) => {
      return {
        ...chatters.data[username],
        firstJoinedTimestamp: parseInt(chatters.data[username].firstJoinedTimestamp, 10),
        firstChatMessageTimestamp: parseInt(chatters.data[username].firstChatMessageTimestamp || '0', 10),
        username,
      }
    })

    const firstJoinedGroupedData = this.groupDataBytimeFrame(chattersArray, 'firstJoinedTimestamp',
                timeFrames[this.state.selectedTimeFrame].interval, timeFrames[this.state.selectedTimeFrame].startTime, timeFrames[this.state.selectedTimeFrame].endTime)
    const firstChatMessageGroupedData = this.groupDataBytimeFrame(chattersArray, 'firstChatMessageTimestamp',
                timeFrames[this.state.selectedTimeFrame].interval, timeFrames[this.state.selectedTimeFrame].startTime, timeFrames[this.state.selectedTimeFrame].endTime)

    return Object.keys(firstJoinedGroupedData).map((timestamp) => ({
      name: moment(parseInt(timestamp, 10)).format(timeFrames[this.state.selectedTimeFrame].format),
      firstNewViewers: firstJoinedGroupedData[timestamp],
      firstNewMessages: firstChatMessageGroupedData[timestamp]
    }))
  }

  private onTimeFrameSelect = (selectedTimeFrame: number) => {
    this.setState({selectedTimeFrame})
  }

  public render() {
    const { chatters, settings } = this.props

    return (
      <Content className={style.chatters}>
        <Row>
          <Col span={18}>
            <Card className={style.chartCard} title="Chart" extra={
              <Select defaultValue={0} onChange={this.onTimeFrameSelect} className={style.timeFrameSelect}>
                {timeFrames.map((timeFrame, index) => (
                  <Option key={timeFrame.label} value={index}>{timeFrame.label}</Option>
                ))}
              </Select>}
            >
              {chatters.isFetching && <Spinner />}
              {chatters.error && <h2>Error loading chatters</h2>}
              {!chatters.isFetching && !chatters.error && <div>
                <ResponsiveContainer height={300} width="100%">
                  <LineChart width={730} height={250} data={this.chartDataTransformer()}
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="linear" dataKey="firstNewViewers" stroke="#8884d8" name="First new viewers" />
                    <Line type="linear" dataKey="firstNewMessages" stroke="#82ca9d" name="First new messages" />
                  </LineChart>
                </ResponsiveContainer>
              </div>}
            </Card>
          </Col>
          <Col span={6}>
            <Card className={style.statusCard} title="Status">
              <div className={style.status}>
                {this.state.sourceLoaded && (settings.data.showFirstJoinedNotification || settings.data.showFirstChatMessageNotification) && <div>
                  <h2 style={{color: '#52c41a'}}>Status: Active</h2>
                </div>}
                {this.state.sourceLoaded && !settings.data.showFirstJoinedNotification && !settings.data.showFirstChatMessageNotification && <div>
                  <h2 style={{color: '#f5222d'}}>Status: Recording</h2>
                </div>}
                {!this.state.sourceLoaded && <div>
                  <h2 style={{color: '#f5222d'}}>Status: Inactive</h2>
                  <p>New users are not being recorded and notification's will not show up. Activate it by adding the extension's source into the active scene.</p>
                </div>}
              </div>
            </Card>
          </Col>
        </Row>
        <Card className={style.chattersCard} title="Chatters">
          {chatters.isFetching && <Spinner />}
          {chatters.error && <h2>Error loading chatters</h2>}
          {!chatters.isFetching && !chatters.error && <div>
            <Table className={style.chattersTable} dataSource={Object.keys(chatters.data).map(this.tableDataTransformer)} columns={this.getColumns()} />
          </div>}
        </Card>
      </Content>
    )
  }
}
export const Chatters = connect(
  (state: IStore) => {
    return {
      chatters: state.chatters,
      configs: state.configs,
      settings: state.settings
    }
  },
  (d: Dispatch<IChattersAction>) => ({ dispatch: d })
)(ChattersC as any)
