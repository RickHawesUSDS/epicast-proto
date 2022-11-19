/**
 * Module dependencies.
 */

import 'module-alias/register'
import { config } from 'dotenv'

import app from '@/server/app'
import Debug from 'debug'
import http from 'http'
import { bootstrapLogger } from '@/utils/loggers'
config()

const debug = Debug('server:server')
bootstrapLogger()

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT ?? '3001')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => console.log('🚀 ~ server launch  ~ port', port))
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number | string | boolean {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string, code: string }): void {
  if (error.syscall !== 'listen') {
    throw new Error(error.code)
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port.toString()

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw new Error(error.code)
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(): void {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + port.toString()
  debug('Listening on ' + bind)
}
