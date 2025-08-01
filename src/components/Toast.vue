<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'
type ToastHorizontalPosition = 'start' | 'center' | 'end'
type ToastVerticalPosition = 'top' | 'middle' | 'bottom'

export interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  horizontal?: ToastHorizontalPosition
  vertical?: ToastVerticalPosition
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000,
  horizontal: 'center',
  vertical: 'bottom',
})

const emit = defineEmits(['close'])

const show = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function close() {
  show.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

onMounted(() => {
  // 延迟显示，确保过渡动画生效
  setTimeout(() => {
    show.value = true
  }, 10)

  // 设置自动关闭计时器
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <div v-if="show" class="toast" :class="[`toast-${horizontal}`, `toast-${vertical}`]">
    <div class="alert" :class="{ 'alert-warning': type === 'warning', 'alert-error': type === 'error', 'alert-success': type === 'success', 'alert-info': type === 'info' }">
      <span>{{ message }}</span>
    </div>
  </div>
</template>
