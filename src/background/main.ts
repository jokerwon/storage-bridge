import { onMessage, sendMessage } from 'webext-bridge/background'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = true

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

onMessage('sync-storage-data', async (e) => {
  const { sourceTabId, targetTabId, keys } = e.data
  const { local, session, cookie } = keys
  const response = await sendMessage('get-storage-data', { local: local.length > 0, session: session.length > 0, cookie: cookie.length > 0 }, { context: 'content-script', tabId: sourceTabId })
  if (!response.success) {
    return {
      success: false,
      reason: 'Failed to get local storage data from source tab.',
    }
  }
  if (!response.data) {
    return {
      success: false,
      reason: 'No data to sync.',
    }
  }
  const tab = await browser.tabs.get(targetTabId)

  const tasks = []
  if (local.length > 0) {
    const localData: Record<string, string> = {}
    local.forEach((key) => {
      localData[key] = response.data!.local[key]
    })
    tasks.push(sendMessage('set-local-storage-data', { data: localData }, { context: 'content-script', tabId: targetTabId }))
  }
  if (session.length > 0) {
    const sessionData: Record<string, string> = {}
    session.forEach((key) => {
      sessionData[key] = response.data!.session[key]
    })
    tasks.push(sendMessage('set-session-storage-data', { data: sessionData }, { context: 'content-script', tabId: targetTabId }))
  }
  if (cookie.length > 0) {
    // const cookieData: Record<string, string> = {}
    cookie.forEach((key) => {
      // cookieData[key] = response.data!.cookie[key]
      tasks.push(
        browser.cookies
          .set({
            url: `https://${tab.url?.split('/')[2]}`,
            name: key,
            value: response.data!.cookie[key],
            path: '/',
            secure: true,
            httpOnly: true,
          })
          .then(() => ({ success: true })),
      )
    })
    // tasks.push(sendMessage('set-cookie-data', { data: cookieData, domain: tab.url?.split('/')[2] || '' }, { context: 'content-script', tabId: targetTabId }))
  }
  try {
    const responses = await Promise.all(tasks)
    if (!responses.every(res => res?.success)) {
      return {
        success: false,
        reason: 'Failed to set storage data to target tab.',
      }
    }
    return {
      success: true,
    }
  }
  catch (error) {
    console.error(error)

    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
