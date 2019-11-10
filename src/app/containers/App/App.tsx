import appConfig from '../../../../config/main'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { getConfigs, IConfigsAction, IConfigsRequest } from '../../redux/modules/configs/configs'
import { IChatters, addChatters } from '../../redux/modules/chatters/chatters'
import { IStore } from '../../redux/IStore'
import { Navigation } from '../../components'
import { renderRoutes } from 'react-router-config'
import { routes } from '../../routes/routes'
import Icon from 'antd/lib/icon'
import notification from 'antd/lib/notification'
import Layout from 'antd/lib/layout'
import Modal from 'antd/lib/Modal'
import Carousel from 'antd/lib/carousel'
import { getHints, IHintsRequest, setHints } from '../../redux/modules/hints/hints'
import { INotification } from '../../redux/modules/notifications/notifications'

const { Header } = Layout
const style = require('./App.scss')

interface IProps {
  dispatch: Dispatch
  configs: IConfigsRequest
  hints: IHintsRequest
}

interface IState {
  loaded: boolean
  introCarouselCurrentSlide: number
}

class AppC extends React.Component<IProps, IState> {
  private carousel: Carousel | null
  private slides: React.ReactElement[]

  constructor(props: IProps) {
    super(props)

    this.state = {
      loaded: false,
      introCarouselCurrentSlide: 0
    }
    this.carousel = null
    this.slides = [
      <div key="1">1</div>,
      <div key="2">2</div>,
      <div key="3">3</div>,
      <div key="3">3</div>
    ]
  }

  public async componentDidMount() {
    const { dispatch, hints, configs } = this.props

    window.Streamlabs.onMessage(this.onMessage)

    try {
      if (!configs.isLoaded) {
        await getConfigs(dispatch)
      }

      if (!hints.isLoaded) {
        await getHints(dispatch)
      }
      this.setState({ loaded: true })
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
        duration: 0
      })
    }
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

  private closeIntroModal = () => {
    const { dispatch, hints } = this.props
    setHints(dispatch, {
      ...hints.data,
      showIntroModal: false
    })
  }

  private nextIntroModal = () => {
    if (this.state.introCarouselCurrentSlide === this.slides.length - 1) {
      this.closeIntroModal()
      return
    }

    if (this.carousel) {
      this.carousel.next()
    }
  }

  // @ts-ignore
  private onCarouselBeforeChange = (currentSlide: number, nextSlide: number) => {
    this.setState({
      introCarouselCurrentSlide: nextSlide
    })
  }

  public render() {
    return this.state.loaded && (
      <Layout>
        <Helmet {...appConfig.app} {...appConfig.app.head} />
        <Header style={{
          backgroundColor: '#30303d',
          padding: 0
        }}>
          <Navigation />
        </Header>
        <Layout className={style.container}>
          {renderRoutes(routes[0].routes)}
        </Layout>
        <Modal
          title="Tutorial"
          centered={true}
          visible={this.props.hints.data.showIntroModal}
          okText="Next"
          onOk={this.nextIntroModal}
          cancelText="Close"
          onCancel={this.closeIntroModal}
          closable={false}
        >
          <div className={style.carousel}>
            <Carousel ref={node => this.carousel = node} beforeChange={this.onCarouselBeforeChange}>
              {this.slides}
            </Carousel>
          </div>
        </Modal>
      </Layout>
    )
  }
}

export const App = connect(
  (state: IStore) => {
    return {
      configs: state.configs,
      hints: state.hints
    }
  },
  (d: Dispatch<IConfigsAction>) => ({ dispatch: d })
)(AppC)
