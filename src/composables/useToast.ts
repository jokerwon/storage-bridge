import { createVNode, ref, render } from 'vue'
import type { ToastProps } from '~/components/Toast.vue'
import Toast from '~/components/Toast.vue'

const toastStack = ref<{ id: number, vnode: any, el: HTMLElement }[]>([])
let toastId = 0

export function useToast() {
  function createToast(options: ToastProps) {
    const id = ++toastId
    const container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)

    const vnode = createVNode(Toast, {
      ...options,
      onClose: () => {
        closeToast(id)
      },
    })

    render(vnode, container)

    const toastItem = {
      id,
      vnode,
      el: container,
    }

    toastStack.value.push(toastItem)
    return id
  }

  function closeToast(id: number) {
    const index = toastStack.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const { el } = toastStack.value[index]
      render(null, el)
      document.body.removeChild(el)
      toastStack.value.splice(index, 1)
    }
  }

  function success(message: string, options: Omit<ToastProps, 'message' | 'type'> = {}) {
    return createToast({ message, type: 'success', ...options })
  }

  function error(message: string, options: Omit<ToastProps, 'message' | 'type'> = {}) {
    return createToast({ message, type: 'error', ...options })
  }

  function warning(message: string, options: Omit<ToastProps, 'message' | 'type'> = {}) {
    return createToast({ message, type: 'warning', ...options })
  }

  function info(message: string, options: Omit<ToastProps, 'message' | 'type'> = {}) {
    return createToast({ message, type: 'info', ...options })
  }

  return {
    toast: createToast,
    success,
    error,
    warning,
    info,
    close: closeToast,
  }
}

// 创建全局实例
let globalToast: ReturnType<typeof useToast> | null = null

export function getToast() {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
}
