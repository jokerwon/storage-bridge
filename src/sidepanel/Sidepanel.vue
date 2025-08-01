<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'
import type { Tabs } from 'webextension-polyfill'
import { useToast } from '~/composables/useToast'

const tabs = ref<Tabs.Tab[]>([])
const storageKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const source = ref(0)
const target = ref(0)
const { success, error, warning } = useToast()

onMounted(async () => {
  tabs.value = await browser.tabs.query({})
})

watch(source, async (newSource) => {
  storageKeys.value = []
  checkedKeys.value = []
  const data = await getStorageData(newSource) || {}
  storageKeys.value = Object.keys(data)
})

async function getStorageData(tabId: number) {
  const ares = await sendMessage('get-local-storage-data', { }, { context: 'content-script', tabId })
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
    const response = await sendMessage('sync-local-storage-data', { sourceTabId: source.value, targetTabId: target.value, keys: checkedKeys.value }, { context: 'background', tabId: 0 })
    if (response?.success) {
      success('Migrate success')
      checkedKeys.value = []
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
        Migrate Options
      </legend>
      <label v-for="key in storageKeys" :key="key" class="label">
        <input v-model="checkedKeys" :value="key" type="checkbox" class="checkbox">
        {{ key }}
      </label>
    </fieldset>
  </main>
</template>
