import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { withRouter as router } from 'react-router-dom';
import { IInfosRequest, IInfosAction, getInfos } from '../../redux/modules/infos';
import { IStore } from '../../redux/IStore';
import Layout from 'antd/lib/layout';
import Card from 'antd/lib/card';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Modal from 'antd/lib/Modal';
import Form from 'antd/lib/form';
import numeral from 'numeral';
import Button from 'antd/lib/button';
import LinesEllipsis from 'react-lines-ellipsis';
import { Spinner } from '../../components';
import Input from 'antd/lib/input';
import TextArea from 'antd/lib/input/TextArea';
import _ from 'lodash';
import { IEnv } from '../../redux/modules/env';

const { Content, Header } = Layout;
const { Meta } = Card;

const style = require('./style.scss');

interface IProps {
  infos: IInfosRequest;
  dispatch: Dispatch;
  env: IEnv;
  form: any;
  location: any;
}

interface IState {
  modalVisible: boolean;
  requestIndex: number;
  submitting: boolean;
}

class LandingC extends React.Component<IProps, IState> {
  private hiddenFormEl: HTMLFormElement | null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      modalVisible: false,
      requestIndex: 0,
      submitting: false
    };

    this.hiddenFormEl = null;
  }

  public async componentDidMount() {
    const { dispatch, location, env } = this.props;

    getInfos(dispatch, location.pathname.split('/')[1], env.SL_API_GATEWAY_URL);
  }

  private openModal = (requestIndex: number) => () => {
    this.setState({
      modalVisible: true,
      requestIndex
    });
  }

  private onSubmit = (e: React.FormEvent) => {
    const { form } = this.props;

    e.preventDefault();
    form.validateFields((errors: any) => {
      if (errors || !this.hiddenFormEl) { return; }

      this.hiddenFormEl.submit();
      this.setState({ submitting: true });
    });

    return false;
  }

  private handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  private renderRequests() {
    const { infos } = this.props;

    return infos.data.requests.map((request, index) => {
      if (!request.active) { return null; }

      return (
        <Col key={index} span={6}>
          <Card
            actions={[<div key="request">See more</div>]}
            className={style.landingCard}
            cover={
              <img
                alt={request.title}
                src={request.imageUrl || 'assets/images/placeholder.png'}
              />
            }
            hoverable={true}
            onClick={this.openModal(index)}
          >
            <Meta
              title={request.title}
              description={<LinesEllipsis
                text={request.description}
                maxLine={6}
                basedOn="letters"
                style={{ height: '125px' }}
              />}
            />
            <strong>{numeral(request.amount).format('0.00$')}</strong>
          </Card>
        </Col>
      );
    });
  }

  private renderForm() {
    const { form } = this.props;

    return (
      <Form id="request-form-modal" onSubmit={this.onSubmit}>
        <Form.Item label="Username">
          {form.getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: 'Please input a username',
              },
              {
                max: 20,
                message: 'Maximum 20 characters'
              },
              {
                pattern: /^[^+=]+$/,
                message: 'You cannot use + or = signs'
              }
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Message">
          {form.getFieldDecorator('message', {
            rules: [
              {
                max: 130,
                message: 'Maximum 130 characters'
              },
              {
                pattern: /^[^+=]+$/,
                message: 'You cannot use + or = signs'
              }
            ],
          })(<TextArea />)}
        </Form.Item>
      </Form>
    );
  }

  public renderHiddenForm() {
    const { infos, form, location, env } = this.props;

    return (
      <form ref={el => this.hiddenFormEl = el} action={env.PAYPAL_PAYMENT_URL} method="post">
        <input type="hidden" name="cmd" value="_xclick" />
        <input type="hidden" name="notify_url" value={env.PAYPAL_API_GATEWAY_URL} />
        <input type="hidden" name="item_name" value={infos.data.requests[this.state.requestIndex].title} />
        <input type="hidden" name="custom" value={JSON.stringify({
          streamer: location.pathname.split('/')[1].toLowerCase(),
          username: form.getFieldValue('username'),
          message: form.getFieldValue('message'),
          requestIndex: this.state.requestIndex
        })} />
        <input type="hidden" name="amount" value={infos.data.requests[this.state.requestIndex].amount} />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="hidden" name="return" value={window.location.href} />
        <input type="hidden" name="cancel_return" value={window.location.href} />
        <input type="hidden" name="charset" value="utf-8" />
      </form>
    );
  }

  public render() {
    const { infos } = this.props;

    return (
      <Layout className={style.landing}>
        <Header style={{
          backgroundColor: '#fff',
          padding: 0,
          borderBottom: '1px solid #e8e8e8'
        }}>
          <h2 className={style.landingLogo}>Stream Request</h2>
        </Header>
        {infos.isFetching && <Spinner />}
        {infos.error && <h2>Error loading infos</h2>}
        {!infos.isFetching && !infos.error &&
          <Content className={style.landingContent}>
            {infos.isFetching && <Spinner />}
            {infos.error && <h2>Error loading infos</h2>}
            {!infos.isFetching && !infos.error && <div>
              <Row gutter={16}>
                {this.renderRequests()}
              </Row>
            </div>}
            {!!infos.data.requests.length && <Modal
              title={infos.data.requests[this.state.requestIndex].title}
              visible={this.state.modalVisible}
              onCancel={this.handleCancel}
              footer={
                <Button loading={this.state.submitting} form="request-form-modal" key="submit" htmlType="submit" type="primary">
                  Request
                </Button>}
            >
              <strong>{numeral(infos.data.requests[this.state.requestIndex].amount).format('0.00$')}</strong>
              <p>{infos.data.requests[this.state.requestIndex].description}</p>
              {this.renderForm()}
              {this.renderHiddenForm()}
          </Modal>}
        </Content>}
      </Layout>
    );
  }
}
export const Landing = connect(
  (state: IStore) => {
    return {
      infos: state.infos,
      env: state.env
    };
  },
  (d: Dispatch<IInfosAction>) => ({ dispatch: d })
)(Form.create({ name: 'request' })(router(LandingC as any) as any));
