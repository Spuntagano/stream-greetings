import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ISettingsRequest, ISettingsAction, getSettings, setSettings, deleteSettings } from '../../redux/modules/settings/settings';
import { IStore } from '../../redux/IStore';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import Form from 'antd/lib/form';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Slider from 'antd/lib/slider';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/Modal';
import notification from 'antd/lib/notification';
import { Spinner } from '../../components/Spinner/Spinner';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { AudioUpload } from '../../components/AudioUpload/AudioUpload';
import _ from 'lodash';
import { INotification } from '../../redux/modules/notifications/notifications';
import { IConfigsRequest } from '../../redux/modules/configs/configs';
import { Notification } from '../../components/Notification/Notification';
import TextArea from 'antd/lib/input/TextArea';
import { ColorPicker } from '../../components/ColorPicker/ColorPicker';
import { deleteHints, getHints, IHintsRequest, setHints } from '../../redux/modules/hints/hints';

const { Content } = Layout;
const { Option } = Select;
const style = require('./Settings.scss');

interface IProps {
  settings: ISettingsRequest;
  configs: IConfigsRequest;
  hints: IHintsRequest;
  dispatch: Dispatch;
  form: any;
  location: any;
}

interface IState {
  previewVisible: boolean;
  previewImage: string;
  fileList: any[];
}

class SettingsC extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public async componentDidMount() {
    const { dispatch, form } = this.props;

    await getHints(dispatch);
    const settings = await getSettings(dispatch);
    form.setFieldsValue({
      ...settings,
    });
  }

  private submit = async (e: React.FormEvent<any>) => {
    const { dispatch, form } = this.props;
    e.preventDefault();

    try {
      const settings = form.getFieldsValue();
      await setSettings(dispatch, settings);
      await window.Streamlabs.postMessage('SETTINGS', settings);

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

  private getTestNotification() {
    const testNotification: INotification = {
      username: 'Spuntagano',
      type: 'MESSAGE',
      chatter: {
        firstJoinedTimestamp: String(new Date().getDate()),
        firstChatMessageTimestamp: String(new Date().getDate()),
        firstChatMessage: 'Like the stream!'
      },
      timestamp: new Date().getDate()
    };

    return testNotification;
  }

  private testNotification = async () => {
    try {
      await window.Streamlabs.postMessage('TEST_NOTIFICATION', this.getTestNotification());
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

  private onToggleNotification = (checked: boolean) => {
    const { hints } = this.props;

    if (checked && hints.data.showToggleNotificationWarningModal) {
      Modal.confirm({
        title: 'Confirm',
        content: 'Bla bla ...',
        onOk: this.toggleNotificationWarningModalOk,
        onCancel: this.toggleNotificationWarningModalCancel
      });
    }
  }

  private toggleNotificationWarningModalOk = () => {
    const { dispatch, hints } = this.props;
    setHints(dispatch, {
      ...hints.data,
      showToggleNotificationWarningModal: false
    });
  }

  private toggleNotificationWarningModalCancel = () => {
    const { form, settings } = this.props;

    form.setFieldsValue({
      ...settings.data,
      showFirstJoinedNotification: false,
      showFirstChatMessageNotification: false
    });
  }

  private showTutorial = () => {
    const { dispatch, hints } = this.props;

    setHints(dispatch, {
      ...hints.data,
      showIntroModal: true
    });
  }

  private clearData = async () => {
    const { dispatch, form } = this.props;
    try {
      await deleteHints(dispatch);
      const settings = await deleteSettings(dispatch);

      form.setFieldsValue({
        ...settings,
      });

      notification.open({
        message: 'Data cleared',
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

  public render() {
    const { settings, form } = this.props;

    const formItemTopLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };

    const formItemBottomLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    return (
      <Content className={style.settings}>
        <Card className={style.settingsCard}>
          {settings.isFetching && <Spinner />}
          {settings.error && <h2>Error loading settings</h2>}
          {!settings.isFetching && !settings.error && <div>
            <Form onSubmit={this.submit} layout="horizontal">
              <div className="clearfix">
                <h1 className={style.title}>Settings</h1>
                <Button type="primary" htmlType="submit" className={style.saveButton} loading={settings.isSaving}>Save settings</Button>
              </div>
              <div className="clearfix">
                <div className={style.halfCol}>
                  <Form.Item {...formItemTopLayout} label="Show New Viewer Notification">
                    {form.getFieldDecorator('showFirstJoinedNotification', { valuePropName: 'checked' })(<Switch onChange={this.onToggleNotification} />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Show First Chat Message Notification">
                    {form.getFieldDecorator('showFirstChatMessageNotification', { valuePropName: 'checked' })(<Switch onChange={this.onToggleNotification} />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Show Image">
                    {form.getFieldDecorator('showImage', { valuePropName: 'checked' })(<Switch />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Play Sound">
                    {form.getFieldDecorator('playSound', { valuePropName: 'checked' })(<Switch />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Profanity Filter">
                    {form.getFieldDecorator('profanityFilter', { valuePropName: 'checked' })(<Switch />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Primary color">
                    {form.getFieldDecorator('primaryColor')(<ColorPicker />)}
                  </Form.Item>
                  <Form.Item {...formItemTopLayout} label="Secondary color">
                    {form.getFieldDecorator('secondaryColor')(<ColorPicker />)}
                  </Form.Item>
                </div>
                <div className={style.halfCol}>
                  <div className={style.notificationPreview}>
                    <Notification notification={this.getTestNotification()} settings={form.getFieldsValue()} display={true} />
                  </div>
                </div>
              </div>
              <div>
                <Form.Item {...formItemBottomLayout} label="Font size">
                  {form.getFieldDecorator('fontSize')(<Slider
                    min={8}
                    max={60}
                  />)}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Font weight">
                  {form.getFieldDecorator('fontWeight')(<Slider
                    min={100}
                    max={700}
                    step={100}
                  />)}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Line height">
                  {form.getFieldDecorator('lineHeight')(<Slider
                    min={1}
                    max={1.5}
                    step={0.01}
                  />)}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Font family">
                  {form.getFieldDecorator('fontFamily')(
                    <Select>
                      <Option value="arial">Arial</Option>
                      <Option value="roboto">Roboto</Option>
                      <Option value="oswald">Oswald</Option>
                      <Option value="montserrat">Montserrat</Option>
                      <Option value="open sans">Open Sans</Option>
                    </Select>
                  )}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="First Joined Message template">
                  {form.getFieldDecorator('firstJoinedMessageTemplate')(<TextArea
                    autoSize={{minRows: 5}}
                    />)}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="First Time Chatting Message template">
                  {form.getFieldDecorator('firstMessageMessageTemplate')(<TextArea
                    autoSize={{minRows: 5}}
                    />)}
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Notification image">
                  <ImageUpload
                    imageKey="notificationImage"
                    onSubmit={this.onImageUpload}
                    onRemove={this.onImageRemove}
                    imageUrl={settings.data.notificationImageUrl}
                  />
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Notification sound">
                  <AudioUpload
                    audioKey="notificationAudio"
                    onSubmit={this.onAudioUpload}
                    onRemove={this.onAudioRemove}
                    audioUrl={settings.data.notificationAudioUrl} />
                </Form.Item>
                {form.getFieldDecorator('notificationImageUrl')(<Input type="hidden" />)}
                {form.getFieldDecorator('notificationAudioUrl')(<Input type="hidden" />)}
                <Form.Item {...formItemBottomLayout} label="Send a test notification">
                  <Button className={style.testNotificationButton} type="default" onClick={this.testNotification}>Test notification</Button>
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Show the tutorial again">
                  <Button className={style.redoTutorialButton} type="default" onClick={this.showTutorial}>Show tutorial</Button>
                </Form.Item>
                <Form.Item {...formItemBottomLayout} label="Clear settings data">
                  <Button className={style.clearHintsButton} type="default" onClick={this.clearData}>Clear data</Button>
                </Form.Item>
                <Button type="primary" htmlType="submit" className={style.saveButton} loading={settings.isSaving}>Save settings</Button>
              </div>
            </Form>
          </div>}
        </Card>
      </Content>
    );
  }
}

export const Settings = connect(
  (state: IStore) => {
    return {
      settings: state.settings,
      configs: state.configs,
      hints: state.hints
    };
  },
  (d: Dispatch<ISettingsAction>) => ({ dispatch: d })
)(Form.create({ name: 'settings' })(SettingsC as any));
