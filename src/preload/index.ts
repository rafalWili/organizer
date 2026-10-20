import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { BirthdaylyApi } from '../shared/ipc'
import type {
  ContactInput,
  DuplicateAction,
  ImportContactDraft,
  Settings,
  TodaySnoozeRequest
} from '../shared/types'

const api: BirthdaylyApi = {
  contacts: {
    list: () => ipcRenderer.invoke('contacts:list'),
    create: (input: ContactInput) => ipcRenderer.invoke('contacts:create', input),
    update: (id: string, input: ContactInput) => ipcRenderer.invoke('contacts:update', id, input),
    remove: (id: string) => ipcRenderer.invoke('contacts:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (patch: Partial<Settings>) => ipcRenderer.invoke('settings:update', patch)
  },
  notifications: {
    test: () => ipcRenderer.invoke('notifications:test'),
    checkNow: () => ipcRenderer.invoke('notifications:check'),
    onSnooze: (listener) => {
      const channel = 'notifications:snooze'
      const wrapped = (_event: IpcRendererEvent, request: TodaySnoozeRequest) => listener(request)
      ipcRenderer.on(channel, wrapped)
      return () => ipcRenderer.removeListener(channel, wrapped)
    },
    snoozeToday: (input) => ipcRenderer.invoke('notifications:snooze-today', input),
    dismissToday: (input) => ipcRenderer.invoke('notifications:dismiss-today', input)
  },
  data: {
    exportJson: () => ipcRenderer.invoke('data:export-json'),
    exportCsv: () => ipcRenderer.invoke('data:export-csv'),
    pickImport: () => ipcRenderer.invoke('data:pick-import'),
    commitImport: (drafts: ImportContactDraft[], duplicateAction: DuplicateAction) =>
      ipcRenderer.invoke('data:commit-import', drafts, duplicateAction)
  },
  app: {
    version: () => ipcRenderer.invoke('app:version')
  }
}

if (!process.contextIsolated) {
  throw new Error('Birthdayly requires contextIsolation.')
}

contextBridge.exposeInMainWorld('birthdayly', api)
