import appConfig from '../../../../config/main';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getConfigs, IConfigsAction, IConfigsRequest } from '../../redux/modules/configs';
import { IStore } from '../../redux/IStore';
import { Navigation } from '../../components';
import { renderRoutes } from 'react-router-config';
import { routes } from '../../routes';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Layout from 'antd/lib/layout';

const { Header } = Layout;
const style = require('./style.scss');

interface IProps {
  dispatch: Dispatch;
  configs: IConfigsRequest;
}

interface IState {
  loaded: boolean;
  sourceLoaded: false;
  theme: string;
}

interface IEvents {
  [s: string]: string[];
}

class AppC extends React.Component<IProps, IState> {
  private streamlabsOBS: any;
  private sourcesQueue: any[];

  constructor(props: IProps) {
    super(props);

    this.sourcesQueue = [];
    this.streamlabsOBS = window.streamlabsOBS;
    this.state = {
      loaded: false,
      sourceLoaded: false,
      theme: 'night'
    };
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    try {
      await getConfigs(dispatch);
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

  public render() {
    return this.state.loaded && (
      <Layout className={style.AppContainer}>
        <Helmet {...appConfig.app} {...appConfig.app.head} />
        <Header style={{
          backgroundColor: '#fff',
          padding: 0
        }}>
          <Navigation className={style.navigation} />
          {this.state.sourceLoaded && <div className={style.sourceLoaded}>Source loaded</div>}
          {!this.state.sourceLoaded && <div className={style.sourceLoaded}>Source not loaded</div>}
        </Header>
        <Layout className={style.container}>
          {renderRoutes(routes[0].routes)}
        </Layout>
      </Layout>
    );
  }
}

export const App = connect(
  (state: IStore) => {
    return { configs: state.configs };
  },
  (d: Dispatch<IConfigsAction>) => ({ dispatch: d })
)(AppC);
