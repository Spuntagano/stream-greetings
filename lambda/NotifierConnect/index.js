const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event) => {
    return new Promise(async (resolve, reject) => {
        try {
            await ddb.put({
                TableName: process.env.CONNECTIONS_TABLE_NAME,
                Item: { connectionId: event.requestContext.connectionId }
            }).promise();
            
            resolve({ statusCode: 200 });
        } catch(err) {
            console.error(err);
            reject({ statusCode: 500 });
        }
    });
}
