global.window = {};
global.navigator = {};

const req = require('request-promise-native');
const { JSEncrypt } = require('jsencrypt');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const privKey = require('./priv_key.js');
require('./patch.js');

exports.handler = async (event) => {
    const ipnContent = {};
    JSON.parse(JSON.parse(event.Records[0].body))['body-text'].split('&').forEach(info => {
        const spilttedInfo = unescape(info).split('=');
        ipnContent[spilttedInfo[0]] = spilttedInfo[1];
    });

    const ipnContentCustom = JSON.parse(ipnContent.custom);
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPrivateKey(Buffer.from(privKey, 'base64').toString());

    const getInfosParams = {
        url: `https://platform.streamlabs.com/api/v1/developer/users/settings?usernames=${ipnContentCustom.streamer}&platform=twitch`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authorization': `Bearer ${process.env.APP_TOKEN}`
        }
    };

    const promise = new Promise(async (resolve, reject) => {
        try {
            const body = await req.get(getInfosParams);
            const data = JSON.parse(body).data;
            if (!data.length) {
                reject('User not found');
                return;
            }

            const profile = JSON.parse(body).data[0];
            const settings = JSON.parse(profile.settings.settings);
            const requests = JSON.parse(profile.settings.requests);
            const notifications = JSON.parse(profile.settings.notifications);

            if (requests[ipnContentCustom.requestIndex].amount !== parseFloat(ipnContent.mc_gross) ||
                requests[ipnContentCustom.requestIndex].title.replace(new RegExp(' ', 'g'), '+') !== ipnContent.item_name ||
                settings.paypalEmail !== ipnContent.receiver_email ||
                ipnContent.mc_currency !== 'USD') {
                reject('Invalid item');
                return;
            }

            const request = {
                streamer: ipnContentCustom.streamer,
                request: requests[ipnContentCustom.requestIndex].title,
                message: ipnContentCustom.message.replace(new RegExp('\\+', 'g'), ' '),
                amount: requests[ipnContentCustom.requestIndex].amount,
                username: ipnContentCustom.username.replace(new RegExp('\\+', 'g'), ' '),
                timestamp: new Date().getTime()
            };

            const postNotificationsParams = {
                url: process.env.STREAMLABS_APP_SETTING_URL,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${jsEncrypt.decrypt(settings.token)}`
                },
                json: {
                    key: 'notifications',
                    value: [request, ...notifications]
                }
            };

            const apigwManagementApi = new AWS.ApiGatewayManagementApi({
                apiVersion: '2018-11-29', endpoint: process.env.API_GATEWAY_ENDPOINT
            });
            
            const connections = await ddb.scan({
                TableName: process.env.CONNECTIONS_TABLE_NAME
            }).promise();

            connections.Items.forEach(async (connection) => {
                await apigwManagementApi.postToConnection({
                    ConnectionId: connection.connectionId,
                    Data: JSON.stringify(request)
                }).promise();
            });

            await req.post(postNotificationsParams);
            resolve('Success');
        } catch (err) {
            console.error(err);
            reject('Request error');
        }
    });

    return promise;
}
