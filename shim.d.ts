import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'get-local-storage-data': ProtocolWithReturn<unknown, MessageResponse<Record<string, string>>>
    'set-local-storage-data': ProtocolWithReturn<{ data: Record<string, string> }, MessageResponse>
    'sync-local-storage-data': ProtocolWithReturn<{ sourceTabId: number, targetTabId: number, keys?: string[] }, MessageResponse>
  }
}
