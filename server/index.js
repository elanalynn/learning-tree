const StaticServer = require('static-server')
// import StaticServer from 'static-server'
const server = new StaticServer({
  rootPath: '.',
  port: 4000,
})

server.start(() => {
  console.log('Server listening on', server.port)
})
