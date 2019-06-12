/** General Configurations Like PORT, HOST names and etc... */

var config = {
  env: process.env.NODE_ENV || 'development',
  httpPort: Number(process.env.HTTP_PORT),
  httpsPort: Number(process.env.HTTPS_PORT),
  karmaPort: 9876,

  // This part goes to React-Helmet for Head of our HTML
  app: {
    head: {
      title: 'Twitchclips',
      titleTemplate: 'Twitchclips: %s',
      meta: [
        { charset: 'utf-8' },
        { 'http-equiv': 'x-ua-compatible', content: 'ie=edge' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Twitchclips' },
      ],
    },
  },
};

module.exports = config;
