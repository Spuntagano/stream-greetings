/** General Configurations Like PORT, HOST names and etc... */

var config = {
  env: process.env.NODE_ENV || 'development',
  karmaPort: 9876,

  // This part goes to React-Helmet for Head of our HTML
  app: {
    head: {
      title: 'Stream Greetings',
      titleTemplate: 'Stream Greetings: %s',
      meta: [
        { charset: 'utf-8' },
        { 'http-equiv': 'x-ua-compatible', content: 'ie=edge' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Stream Greetings' },
      ],
    },
  },
}

module.exports = config
