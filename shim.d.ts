import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'get-storage-data': ProtocolWithReturn<{ local?: boolean, session?: boolean, cookie?: boolean }, MessageResponse<{ local: Record<string, string>, session: Record<string, string>, cookie: Record<string, string> }>>
    'set-local-storage-data': ProtocolWithReturn<{ data: Record<string, string> }, MessageResponse>
    'set-session-storage-data': ProtocolWithReturn<{ data: Record<string, string> }, MessageResponse>
    'set-cookie-data': ProtocolWithReturn<{ data: Record<string, string>, domain: string }, MessageResponse>
    'sync-storage-data': ProtocolWithReturn<{ sourceTabId: number, targetTabId: number, keys: { local: string[], session: string[], cookie: string[] } }, MessageResponse>
  }
}
