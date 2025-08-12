export const environment = {
  production: true,
  connector: "api",
  webSocket: {
    endpoint: 'http://10.10.1.12:8080/ws',
    defaultTopic: '/topic/greetings',
    pkmiTopic: '/topic/pkmi'
  },
  api: {
    protocol: 'http',
    hostname: '10.10.1.12',
    port: '8080',
    context: null
  }
};
