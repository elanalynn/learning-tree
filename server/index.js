var StaticServer = require('static-server')
var server = new StaticServer({
  rootPath: '.',
  port: 4000,
})

server.start(() => {
  console.log('Server listening on', server.port)
})
