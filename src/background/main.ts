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
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

onMessage('sync-local-storage-data', async (e) => {
  const { sourceTabId, targetTabId, keys } = e.data
  let response = await sendMessage('get-local-storage-data', {}, { context: 'content-script', tabId: sourceTabId })
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
  let data: Record<string, string> = {}
  if (keys) {
    keys.forEach((key) => {
      data[key] = response.data![key]
    })
  }
  else {
    data = response.data
  }

  response = await sendMessage('set-local-storage-data', { data }, { context: 'content-script', tabId: targetTabId })
  if (!response.success) {
    return {
      success: false,
      reason: 'Failed to set local storage data to target tab.',
    }
  }
  return {
    success: true,
  }
})
