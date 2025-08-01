import { onMessage } from 'webext-bridge/content-script'
// import { createApp } from 'vue'
// import App from './views/App.vue'
// import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  onMessage('get-local-storage-data', () => {
    const storageData: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) as string
      storageData[key] = localStorage.getItem(key) as string
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
