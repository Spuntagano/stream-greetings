import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import JSEncrypt from 'jsencrypt';
import { ISettingsRequest, ISettingsAction, getSettings, setSettings } from '../../redux/modules/settings';
import { IStore } from '../../redux/IStore';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import Form from 'antd/lib/form';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import notification from 'antd/lib/notification';
import { Spinner } from '../../components/Spinner';
import { ImageUpload } from '../../components/ImageUpload';
import { AudioUpload } from '../../components/AudioUpload';
import _ from 'lodash';
import { INotification } from '../../redux/modules/notifications';
import { IConfigsRequest } from '../../redux/modules/configs';
import { IEnv } from '../../redux/modules/env';

const { Content } = Layout;
const style = require('./style.scss');

interface IProps {
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  dispatch: Dispatch;
  env: IEnv;
  form: any;
  location: any;
}

interface IState {
  previewVisible: boolean;
  previewImage: string;
  fileList: any[];
}

class SettingsC extends React.Component<IProps, IState> {
  private onSubmit: () => (e: React.FormEvent<any>) => void;
  private inputEl: Input | null;
  public jsEncrypt: any;

  constructor(props: IProps) {
    super(props);

    this.jsEncrypt = new JSEncrypt();
    this.jsEncrypt.setPublicKey(atob(props.env.PUB_KEY));
    this.inputEl = null;

    this.onSubmit = () => this.submit.bind(this);
  }

  public async componentDidMount() {
    const { dispatch, form, configs } = this.props;

    const settings = await getSettings(dispatch);
    form.setFieldsValue({
      ...settings,
      token: this.jsEncrypt.encrypt(configs.data.token)
    });
  }

  private async submit(e: React.FormEvent<any>) {
    const { dispatch, form } = this.props;
    e.preventDefault();

    try {
      const settings = form.getFieldsValue();
      await setSettings(dispatch, settings);
      await window.Streamlabs.postMessage('settings', settings);

      notification.open({
        message: 'Settings saved',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      });
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
      });
    }
  }

  private testNotification = async () => {
    const { configs } = this.props;

    try {
      const testNotification: INotification = {
        streamer: configs.data.profiles.streamlabs.name,
        username: 'test user',
        amount: 5,
        message: 'test message',
        request: 'test request',
        timestamp: new Date().getDate()
      };

      await window.Streamlabs.postMessage('testNotification', testNotification);
      notification.open({
        message: 'Test notification sent',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      });
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
      });
    }
  }

  private onImageUpload = (url: string) => {
    const { form } = this.props;

    form.setFieldsValue({
      notificationImageUrl: url
    });
  }

  private onImageRemove = () => {
    const { form } = this.props;

    form.setFieldsValue({
      notificationImageUrl: null
    });
  }

  private onAudioUpload = (url: string) => {
    const { form } = this.props;

    form.setFieldsValue({
      notificationAudioUrl: url
    });
  }

  private onAudioRemove = () => {
    const { form } = this.props;

    form.setFieldsValue({
      notificationAudioUrl: null
    });
  }

  private onCopy = () => {
    if (this.inputEl) {
      this.inputEl.select();
      document.execCommand('copy');

      notification.open({
        message: 'URL copied to clipboard!',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      });
    }
  }

  private getBaseUrl() {
    const loc = location.href.split('/');
    loc.pop();
    loc.pop();

    return loc.join('/');
  }

  public render() {
    const { settings, form, configs } = this.props;

    return (
      <div className={style.Home}>
        <Content className={style.settings}>
          <Card className={style.settingsCard}>
            {settings.isFetching && <Spinner />}
            {settings.error && <h2>Error loading settings</h2>}
            {!settings.isFetching && !settings.error && <div>
              <h1>Settings</h1>
              <Form onSubmit={this.onSubmit()}>
                <Form.Item label="Paypal Email">
                  {form.getFieldDecorator('paypalEmail', {
                    rules: [
                      {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                      },
                      {
                        required: true,
                        message: 'Please input your E-mail!',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
                <Form.Item label="Request page URL">
                  <Input ref={el => this.inputEl = el}
                    value={`${this.getBaseUrl()}/index.html#/${configs.data.profiles.streamlabs.name}`}
                    addonAfter={<Icon type="copy" onClick={this.onCopy} />}
                    suffix={
                      <Tooltip title="This is the url where your viewers can make requests.
                      You should link to this page on your Twitch page or Youtube description">
                        <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    }
                  />
                  <Button type="default" onClick={this.testNotification}>Test notification</Button>
                </Form.Item>
                <Form.Item label="Show Image">
                  {form.getFieldDecorator('showImage', { valuePropName: 'checked' })(<Switch />)}
                </Form.Item>
                <Form.Item label="Play Sound">
                  {form.getFieldDecorator('playSound', { valuePropName: 'checked' })(<Switch />)}
                </Form.Item>
                <Form.Item label="Profanity Filter">
                  {form.getFieldDecorator('profanityFilter', { valuePropName: 'checked' })(<Switch />)}
                </Form.Item>
                <Form.Item>
                  <ImageUpload
                    imageKey="notificationImage"
                    onSubmit={this.onImageUpload}
                    onRemove={this.onImageRemove}
                    imageUrl={settings.data.notificationImageUrl}
                  />
                </Form.Item>
                <Form.Item>
                  <AudioUpload
                    audioKey="notificationAudio"
                    onSubmit={this.onAudioUpload}
                    onRemove={this.onAudioRemove}
                    audioUrl={settings.data.notificationAudioUrl} />
                </Form.Item>
                {form.getFieldDecorator('notificationImageUrl')(<Input type="hidden" />)}
                {form.getFieldDecorator('notificationAudioUrl')(<Input type="hidden" />)}
                {form.getFieldDecorator('token')(<Input type="hidden" />)}
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={settings.isSaving}>Save settings</Button>
                </Form.Item>
              </Form>
            </div>}
          </Card>
        </Content>
      </div >
    );
  }
}

export const Settings = connect(
  (state: IStore) => {
    return {
      settings: state.settings,
      configs: state.configs,
      env: state.env
    };
  },
  (d: Dispatch<ISettingsAction>) => ({ dispatch: d })
)(Form.create({ name: 'settings' })(SettingsC as any));
