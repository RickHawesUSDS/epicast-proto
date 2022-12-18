import 'module-alias/register'
import { config } from 'dotenv-flow'
import { bootstrapLogger } from '@/server/loggers'
import { App } from '@/server/app'

// Load the .env config file into process.env
const loaded = config()
if (loaded.error !== undefined) {
  throw new Error('Unable to load .env file')
}
console.info(`Configured for the ${process.env.NODE_ENV ?? 'not set'} environment`)

// Logger
bootstrapLogger()

// Startup the app for a demo
const app = new App()
app
  .normalDemoStartup()
  .then(() => {
    // Start listening
    app.listen()
  })
  .catch(error => console.log(error))

// Handle the Ctrl-C to termininate the app
process.on('SIGINT', () => {
  console.info('SIGINT received.')
  app.closeAndStop().then(() => process.exit()).catch(() => {})
})
