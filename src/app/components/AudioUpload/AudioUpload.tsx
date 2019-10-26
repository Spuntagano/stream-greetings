import * as React from 'react';
import Upload from 'antd/lib/upload';
import Modal from 'antd/lib/Modal';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import _ from 'lodash';

const style = require('./AudioUpload.scss');

interface IProps {
    audioKey: string;
    audioUrl: string;
    onSubmit?: (url: string) => void;
    onRemove?: () => void;
}

interface IState {
    previewVisible: boolean;
    previewAudio: string;
    fileList: any[];
}

class AudioUploadC extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            previewVisible: false,
            previewAudio: '',
            fileList: props.audioUrl ? [
                {
                    uid: '-1',
                    name: 'xxx.mp3',
                    status: 'done',
                    url: props.audioUrl
                },
            ] : [],
        };
    }

    private getBase64 = (file: any) => {
        return new Promise((resolve: any, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    private handleCancel = () => this.setState({ previewVisible: false });

    private handlePreview = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await this.getBase64(file.originFileObj);
        }

        this.setState({
            previewAudio: file.url || file.preview,
            previewVisible: true,
        });
    }

    private handleChange = async ({ fileList }: any) => {
        const { onRemove } = this.props;
        if (onRemove) {
            onRemove();
        }

        this.setState({ fileList });
    }

    private customRequest = (upload: any) => {
        const { audioKey, onSubmit } = this.props;

        const promise = new Promise(async (resolve, reject) => {
            try {
                const data = await window.Streamlabs.userSettings.addAssets([{ name: audioKey, file: upload.file }]);
                this.setState({ fileList: [{ ...upload.file, url: data[audioKey] }] });
                if (onSubmit) {
                    onSubmit(data[audioKey]);
                }
                resolve(data);
            } catch (e) {
                notification.open({
                    message: 'An error as occured',
                    icon: <Icon type="exclamation-circle" style={{ color: '#ff0000' }} />,
                });
                reject(e.message);
            }
        });

        return {
            promise,
            abort() { return; }
        };
    }

    private uploadButton = () => (
        <div>
            <Icon type="plus" />
            <div className="ant-upload-text">Upload</div>
        </div>
    )

    public render() {
        const { previewVisible, previewAudio, fileList } = this.state;

        return (
            <div className={`${style.imageUpload} clearfix`}>
                <Upload
                    accept="audio/*"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    customRequest={this.customRequest}
                >
                    {fileList.length >= 1 ? null : this.uploadButton()}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <audio style={{ width: '100%', margin: '100px 0' }} controls={true} src={previewAudio} />
                </Modal>
            </div>
        );
    }
}
export const AudioUpload = AudioUploadC;
