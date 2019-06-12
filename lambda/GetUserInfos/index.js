const req = require('request-promise-native');

exports.handler = async (event) => {
    const params = {
        url: `https://platform.streamlabs.com/api/v1/developer/users/settings?usernames=${event.username}&platform=twitch`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authorization': `Bearer ${process.env.APP_TOKEN}`
        }
    };
    
    const promise = new Promise(async (resolve, reject) => {
        try {
            const body = await req.get(params);
            const data = JSON.parse(body).data;
            if (!data.length) {
                reject('User not found');
                return;
            } 

            resolve({ infos: JSON.parse(body).data[0] });
        } catch (err) {
            console.error(err);
            reject('Request error');
        }
    });
    
    return promise;
}
