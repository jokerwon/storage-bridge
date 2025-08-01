type MessageType = 'get-tab-storage-data' | 'set-tab-storage-data'

interface MessageResponse<T = any> {
  success: boolean
  data?: T
  [key: string]: any
}
