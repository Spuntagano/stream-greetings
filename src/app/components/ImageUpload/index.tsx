import * as React from 'react';
import Upload from 'antd/lib/upload';
import Modal from 'antd/lib/Modal';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import _ from 'lodash';

const style = require('./style.scss');

interface IProps {
    imageKey: string;
    imageUrl: string;
    onSubmit?: (url: string) => void;
    onRemove?: () => void;
}

interface IState {
    previewVisible: boolean;
    previewImage: string;
    fileList: any[];
}

class ImageUploadC extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: props.imageUrl ? [
                {
                    uid: '-1',
                    name: 'xxx.png',
                    status: 'done',
                    url: props.imageUrl
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
            previewImage: file.url || file.preview,
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
        const { imageKey, onSubmit } = this.props;

        const promise = new Promise(async (resolve, reject) => {
            try {
                const data = await window.Streamlabs.userSettings.addAssets([{ name: imageKey, file: upload.file }]);
                this.setState({ fileList: [{ ...upload.file, url: data[imageKey] }] });
                if (onSubmit) {
                    onSubmit(data[imageKey]);
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
        const { previewVisible, previewImage, fileList } = this.state;

        return (
            <div className={`${style.imageUpload} clearfix`}>
                <div className={`${style.imageUploadLabel} ant-form-item-label`}>
                    <label>
                        Custom notification image
                    </label>
                </div>
                <Upload
                    accept="image/*"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    customRequest={this.customRequest}
                >
                    {fileList.length >= 1 ? null : this.uploadButton()}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}
export const ImageUpload = ImageUploadC;
