import appConfig from '../../../../config/main';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getConfigs, IConfigsAction, IConfigsRequest } from '../../redux/modules/configs/configs';
import { IStore } from '../../redux/IStore';
import { Navigation } from '../../components';
import { renderRoutes } from 'react-router-config';
import { routes } from '../../routes';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Layout from 'antd/lib/layout';
import Modal from 'antd/lib/Modal';
import Tooltip from 'antd/lib/tooltip';
import Carousel from 'antd/lib/carousel';
import { getHints, IHintsRequest, setHints } from '../../redux/modules/hints/hints';

const { Header } = Layout;
const style = require('./App.scss');

interface IProps {
  dispatch: Dispatch;
  configs: IConfigsRequest;
  hints: IHintsRequest;
}

interface IState {
  loaded: boolean;
  sourceLoaded: false;
  theme: string;
  introCarouselCurrentSlide: number;
}

interface IEvents {
  [s: string]: string[];
}

class AppC extends React.Component<IProps, IState> {
  private streamlabsOBS: any;
  private sourcesQueue: any[];
  private carousel: Carousel | null;
  private slides: React.ReactElement[];

  constructor(props: IProps) {
    super(props);

    this.sourcesQueue = [];
    this.streamlabsOBS = window.streamlabsOBS;
    this.state = {
      loaded: false,
      sourceLoaded: false,
      theme: 'night',
      introCarouselCurrentSlide: 0
    };
    this.carousel = null;
    this.slides = [
      <div key="1">1</div>,
      <div key="2">2</div>,
      <div key="3">3</div>,
      <div key="3">3</div>
    ];
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    try {
      await getConfigs(dispatch);
      await getHints(dispatch);
      this.setState({ loaded: true });
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
        duration: 0
      });
    }

    if (!this.streamlabsOBS) { return; }
    this.streamlabsOBS.apiReady.then(() => {
      this.streamlabsOBS.v1.Theme.getTheme().then((theme: any) => {
        this.setState({ theme });
      });

      this.streamlabsOBS.v1.Theme.themeChanged((theme: any) => {
        this.setState({ theme });
      });

      const events: IEvents = {
        Sources: ['sourceAdded', 'sourceRemoved', 'sourceUpdated'],
        Scenes: ['sceneAdded', 'sceneRemoved', 'sceneSwitched']
      };

      this.detectIfSourceIsInScene();
      Object.keys(events).forEach((key: string) => {
        events[key].forEach((event: string) => {
          this.streamlabsOBS.v1[key][event](this.detectIfSourceIsInScene);
        });
      });
    });
  }

  private detectIfSourceIsInScene = async () => {
    const scene = await this.streamlabsOBS.v1.Scenes.getActiveScene();
    const sources = await this.streamlabsOBS.v1.Sources.getAppSources();
    let sourceLoaded = false;

    this.nodeCrawler(scene.nodes);
    this.sourcesQueue.forEach((node: any) => {
      sources.forEach((source: any) => {
        if (node.sourceId === source.id) {
          sourceLoaded = true;
        }
      });
    });

    this.setState({ sourceLoaded });
    this.sourcesQueue = [];
  }

  private async nodeCrawler(nodes: any[]) {
    nodes.forEach(async (node: any) => {
      if (node.type === 'folder') {
        this.nodeCrawler(node);
      } else if (node.type === 'scene_item') {
        this.sourcesQueue.push(node);
      }
    });
  }

  private closeIntroModal = () => {
    const { dispatch, hints } = this.props;
    setHints(dispatch, {
      ...hints.data,
      showIntroModal: false
    });
  }

  private nextIntroModal = () => {
    if (this.state.introCarouselCurrentSlide === this.slides.length - 1) {
      this.closeIntroModal();
      return;
    }

    if (this.carousel) {
      this.carousel.next();
    }
  }

  // @ts-ignore
  private onCarouselBeforeChange = (currentSlide: number, nextSlide: number) => {
    this.setState({
      introCarouselCurrentSlide: nextSlide
    });
  }

  public render() {
    return this.state.loaded && (
      <Layout className={style.AppContainer}>
        <Helmet {...appConfig.app} {...appConfig.app.head} />
        <Header style={{
          backgroundColor: '#30303d',
          padding: 0
        }}>
          <Navigation className={style.navigation} />
          <div className={style.sourceLoaded}>
            {this.state.sourceLoaded && <Tooltip placement="bottomRight" title="New users are being recorded">
              <span style={{color: '#52c41a'}}>Status: Active</span>
            </Tooltip>}
            {!this.state.sourceLoaded &&
              <Tooltip
                placement="bottomRight"
                title="New users are not being recorded and notification's will not show up. Activate it by adding the extension's source into the active scene"
              >
                <span style={{color: '#f5222d'}}>Status: Inactive</span>
              </Tooltip>}
          </div>
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
    );
  }
}

export const App = connect(
  (state: IStore) => {
    return {
      configs: state.configs,
      hints: state.hints
    };
  },
  (d: Dispatch<IConfigsAction>) => ({ dispatch: d })
)(AppC);
