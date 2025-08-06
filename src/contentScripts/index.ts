import Cookies from 'js-cookie'
import { onMessage } from 'webext-bridge/content-script'
// import { createApp } from 'vue'
// import App from './views/App.vue'
// import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  onMessage('get-storage-data', async (e) => {
    const { local, session, cookie } = e.data
    const storageData: Record<'local' | 'session' | 'cookie', Record<string, string>> = {
      local: {},
      session: {},
      cookie: {},
    }
    if (local) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) as string
        storageData.local[key] = localStorage.getItem(key) as string
      }
    }
    if (session) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i) as string
        storageData.session[key] = sessionStorage.getItem(key) as string
      }
    }
    if (cookie) {
      storageData.cookie = Cookies.get()
    }
    return {
      success: true,
      data: storageData,
    }
  })

  onMessage('set-local-storage-data', async (e) => {
    const data = e.data?.data
    Object.keys(data).forEach((key) => {
      window.localStorage.setItem(key, data[key])
    })
    return {
      success: true,
    }
  })
  onMessage('set-session-storage-data', async (e) => {
    const data = e.data?.data
    Object.keys(data).forEach((key) => {
      window.sessionStorage.setItem(key, data[key])
    })
    return {
      success: true,
    }
  })
  // onMessage('set-cookie-data', async (e) => {
  //   const data = e.data?.data
  //   console.log(data, e.data.domain)

  //   Object.keys(data).forEach((key) => {
  //     Cookies.set(key, data[key], {
  //       domain: e.data.domain,
  //       path: '/',
  //       secure: true,
  //       httpOnly: true,
  //     })
  //   })
  //   return {
  //     success: true,
  //   }
  // })

  // mount component to context window
  // const container = document.createElement('div')
  // container.id = __NAME__
  // const root = document.createElement('div')
  // const styleEl = document.createElement('link')
  // const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  // styleEl.setAttribute('rel', 'stylesheet')
  // styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  // shadowDOM.appendChild(styleEl)
  // shadowDOM.appendChild(root)
  // document.body.appendChild(container)
  // const app = createApp(App)
  // setupApp(app)
  // app.mount(root)
})()
