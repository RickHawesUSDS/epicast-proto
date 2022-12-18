import 'module-alias/register'
import { config } from 'dotenv-flow'
import { bootstrapLogger } from '@/server/loggers'
import { App } from '@/server/app'

// Load the .env config file into process.env
const loaded = config()
if (loaded.error !== undefined) {
  throw new Error('Unable to load .env file')
}
console.log(`Configured for the ${process.env.NODE_ENV ?? 'not set'} environment`)

// Logger
bootstrapLogger()

// Now init the app
const app = new App()
app
  .init()
  .then(() => {
    // Start the server after init
    app.listen()
  })
  .catch(error => console.log(error))
