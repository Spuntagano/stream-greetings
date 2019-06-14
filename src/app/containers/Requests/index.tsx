import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import cryptoJs from 'crypto-js';
import { IRequestsRequest, IRequestsAction, getRequests, setRequests, deleteRequests, IRequest } from '../../redux/modules/requests';
import { IStore } from '../../redux/IStore';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Form from 'antd/lib/form';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import { Spinner } from '../../components';
import _ from 'lodash';
import numeral from 'numeral';
import LinesEllipsis from 'react-lines-ellipsis';
import TextArea from 'antd/lib/input/TextArea';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Modal from 'antd/lib/Modal';
import List from 'antd/lib/List';
import Switch from 'antd/lib/switch';
import { ImageUpload } from '../../components/ImageUpload';

const { Content } = Layout;
const style = require('./style.scss');

interface IProps {
  requests: IRequestsRequest;
  dispatch: Dispatch;
  form: any;
}

interface IState {
  showFormModal: boolean;
  editIndex: number;
}

class RequestsC extends React.Component<IProps> {
  public state: IState;

  constructor(props: IProps) {
    super(props);

    this.state = {
      showFormModal: false,
      editIndex: 0
    };
  }

  public async componentDidMount() {
    const { dispatch } = this.props;

    getRequests(dispatch);
  }

  private onSubmit = (e: React.FormEvent<any>) => {
    const { dispatch, form, requests } = this.props;
    e.preventDefault();

    form.validateFields(async (errors: any) => {
      if (errors) { return; }

      try {
        await setRequests(dispatch, form.getFieldsValue(), requests.data, this.state.editIndex);

        this.setState({ showFormModal: false });
        notification.open({
          message: 'Request saved',
          icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
        });
      } catch (e) {
        notification.open({
          message: 'An error as occured',
          icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
        });
      }
    });
  }

  private onDelete = (deleteIndex: number) => async () => {
    const { dispatch, requests } = this.props;

    try {
      if (!confirm(`Are you sure you want to delete ${requests.data[deleteIndex].title} ?`)) { return; }
      await deleteRequests(dispatch, requests.data, deleteIndex);

      notification.open({
        message: 'Request deleted',
        icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      });
    } catch (e) {
      notification.open({
        message: 'An error as occured',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
      });
    }
  }

  private onFormModalCancel = () => {
    const { form } = this.props;

    this.setState({ showFormModal: false });
    form.resetFields();
  }

  private onFormModalShow = (editIndex: number) => () => {
    const { form, requests } = this.props;

    this.setState({
      showFormModal: true,
      editIndex
    });

    form.setFieldsValue(requests.data[editIndex]);
  }

  private onImageUpload = (url: string) => () => {
    const { form } = this.props;

    form.setFieldsValue({
      imageUrl: url
    });
  }

  private onImageRemove = () => {
    const { form } = this.props;

    form.setFieldsValue({
      imageUrl: ''
    });
  }

  private renderForm = () => {
    const { form, requests } = this.props;
    const imageKey = cryptoJs.SHA256(form.getFieldValue('title') || '' + this.state.editIndex).toString();
    const imageUrl = (requests.data[this.state.editIndex]) ? requests.data[this.state.editIndex].imageUrl : '';

    return (
      <Form id="request-form-modal" onSubmit={this.onSubmit}>
        <Form.Item label="Title">
          {form.getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: 'Please input a title',
              }, {
                max: 80,
                message: 'Maximum 80 characters'
              }
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Description">
          {form.getFieldDecorator('description', {
            rules: [
              {
                required: true,
                message: 'Please input a description',
              }, {
                max: 200,
                message: 'Maximum 200 characters'
              }
            ],
          })(<TextArea autosize={{ minRows: 5, maxRows: 10 }} />)}
        </Form.Item>
        <Form.Item label="Amount">
          {form.getFieldDecorator('amount', {
            rules: [
              {
                required: true,
                message: 'Please input an amount',
              }
            ],
          })(<InputNumber
            min={0} max={10000} precision={2}
          />)}
        </Form.Item>
        <Form.Item label="Active">
          {form.getFieldDecorator('active', { valuePropName: 'checked' })(<Switch />)}
        </Form.Item>
        <Form.Item>
          <ImageUpload imageKey={imageKey} onSubmit={this.onImageUpload} onRemove={this.onImageRemove} imageUrl={imageUrl} />
        </Form.Item>
        {form.getFieldDecorator('imageUrl')(<Input type="hidden" />)}
      </Form>
    );
  }

  private renderList = () => {
    const { requests } = this.props;

    return (
      <List
        itemLayout="horizontal"
        dataSource={requests.data}
        renderItem={this.renderListItem}
      />
    );
  }

  private renderListItem = (data: IRequest, index: number) => {
    return (
      <List.Item className={(!data.active) ? style.requestsInactive : ''} actions={[
        <Icon className={style.requestsAction} onClick={this.onFormModalShow(index)} key="edit" type="edit" />,
        <Icon className={style.requestsAction} onClick={this.onDelete(index)} key="delete" type="delete" />
      ]}>
        <List.Item.Meta
          avatar={<img style={{ width: '100%', maxWidth: '50px' }} alt={data.title} src={(data.imageUrl) ? data.imageUrl : '/assets/images/placeholder.png'} />}
          title={data.title}
          description={<LinesEllipsis
            text={data.description}
            maxLine={2}
            basedOn="letters"
            style={{ height: '42px', overflow: 'hidden' }}
          />}
        />
        <div className={style.requestsAmount}>{numeral(data.amount).format('0.00$')}</div>
      </List.Item>
    );
  }

  public render() {
    const { requests } = this.props;

    return (
      <div className={style.requests}>
        <Content>
          <Card className={style.requestsCard}>
            {requests.isFetching && <Spinner />}
            {requests.error && <h2>Error loading requests</h2>}
            {!requests.isFetching && !requests.error && <div>
              <h1>Requests</h1>
              <Modal
                title="Edit request"
                visible={this.state.showFormModal}
                onCancel={this.onFormModalCancel}
                footer={[
                  <Button form="request-form-modal" key="submit" htmlType="submit" type="primary">
                    Save
                  </Button>
                ]}
              >
                {this.renderForm()}
              </Modal>
              {this.renderList()}
              <Button className={style.requestsNew} type="primary" onClick={this.onFormModalShow(requests.data.length)}>New request</Button>
            </div>}
          </Card>
        </Content>
      </div>
    );
  }
}
export const Requests = connect(
  (state: IStore) => {
    return { requests: state.requests };
  },
  (d: Dispatch<IRequestsAction>) => ({ dispatch: d })
)(Form.create({ name: 'requests' })(RequestsC as any));
