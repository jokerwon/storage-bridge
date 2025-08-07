<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'
import type { Tabs } from 'webextension-polyfill'
import { useToast } from '~/composables/useToast'

const { success, error, warning } = useToast()

const tabs = ref<Tabs.Tab[]>([])

const source = ref(0)
const target = ref(0)

const localKeys = ref<string[]>([])
const sessionKeys = ref<string[]>([])
const cookieKeys = ref<string[]>([])
const checkedLocalKeys = ref<string[]>([])
const checkedSessionKeys = ref<string[]>([])
const checkedCookieKeys = ref<string[]>([])

onMounted(async () => {
  tabs.value = await browser.tabs.query({})
})

watch(source, async (newSource) => {
  clearKeys()
  clearChecked()
  const data = await getStorageData(newSource)
  localKeys.value = Object.keys(data?.local || {})
  sessionKeys.value = Object.keys(data?.session || {})
  const cookieData = await getCookieData(newSource)
  cookieKeys.value = Object.keys(cookieData || {})
})

function clearKeys() {
  localKeys.value = []
  sessionKeys.value = []
  cookieKeys.value = []
}

function clearChecked() {
  checkedLocalKeys.value = []
  checkedSessionKeys.value = []
  checkedCookieKeys.value = []
}

async function getStorageData(tabId: number) {
  const ares = await sendMessage('get-storage-data', { local: true, session: true }, { context: 'content-script', tabId })
  return ares?.data
}
async function getCookieData(tabId: number) {
  const ares = await sendMessage('get-cookie-data', { tabId }, {
    context: 'background',
    tabId: 0, // [INFO] 这里的 tabId 要设为 0，否则无法正常触发事件
  })
  return ares?.data
}

function onMigrate() {
  if (!source.value) {
    warning('Please select source tab.')
    return
  }
  if (!target.value) {
    warning('Please select target tab.')
    return
  }
  if (source.value === target.value) {
    warning('Source and target tabs are the same.')
    return
  }
  syncStorageData()
}

async function syncStorageData() {
  try {
    const response = await sendMessage(
      'sync-storage-data',
      {
        sourceTabId: source.value,
        targetTabId: target.value,
        keys: {
          local: checkedLocalKeys.value,
          session: checkedSessionKeys.value,
          cookie: checkedCookieKeys.value,
        },
      },
      {
        context: 'background',
        tabId: 0, // [INFO] 这里的 tabId 要设为 0，否则无法正常触发事件
      },
    )
    if (response?.success) {
      success('Migrate success')
      clearChecked()
    }
    else {
      error(response?.reason || 'Migrate failed')
    }
  }
  catch (e) {
    console.error('Migrate failed', e)
    error('Migrate failed')
  }
}
</script>

<template>
  <main class="max-w-md mx-auto px-4 py-5 text-gray-700">
    <fieldset class="fieldset">
      <label class="label">Source Tab</label>
      <select v-model="source" class="select w-full">
        <option v-for="tab in tabs" :key="tab.id" :value="tab.id" :selected="tab.id === source">
          {{ tab.title }}
        </option>
      </select>

      <label class="label">Target Tab</label>
      <select v-model="target" class="select w-full">
        <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
          {{ tab.title }}
        </option>
      </select>

      <button class="btn btn-neutral mt-4" @click="onMigrate">
        Migrate
      </button>
    </fieldset>

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
      <legend class="fieldset-legend">
        Local Storage
      </legend>
      <label v-for="key in localKeys" :key="key" class="label">
        <input v-model="checkedLocalKeys" :value="key" type="checkbox" class="checkbox">
        {{ key }}
      </label>
    </fieldset>

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
      <legend class="fieldset-legend">
        Session Storage
      </legend>
      <label v-for="key in sessionKeys" :key="key" class="label">
        <input v-model="checkedSessionKeys" :value="key" type="checkbox" class="checkbox">
        {{ key }}
      </label>
    </fieldset>

    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
      <legend class="fieldset-legend">
        Cookie Storage
      </legend>
      <label v-for="key in cookieKeys" :key="key" class="label">
        <input v-model="checkedCookieKeys" :value="key" type="checkbox" class="checkbox">
        {{ key }}
      </label>
    </fieldset>
  </main>
</template>
