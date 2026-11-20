import Helper from '@codeceptjs/helper'
import { createServer } from 'vite'

/** Starts the app locally so `npm test` needs no separate terminal. */
class AppServer extends Helper {
  async _before() {
    if (process.env.TEST_BASE_URL) {
      return
    }
    this.server = await createServer({
      configFile: 'vite.config.ts',
      server: {
        host: '127.0.0.1',
        port: 4173,
        strictPort: true,
      },
      logLevel: 'error',
    })
    await this.server.listen()
  }

  async _after() {
    await this.server?.close()
    this.server = undefined
  }
}

export default AppServer
