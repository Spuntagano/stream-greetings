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
}

class AppC extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      loaded: false
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
  }

  public render() {
    return this.state.loaded && (
      <Layout className={style.AppContainer}>
        <Helmet {...appConfig.app} {...appConfig.app.head} />
        <Header style={{
          backgroundColor: '#fff',
          padding: 0
        }}>
        <Navigation />
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
