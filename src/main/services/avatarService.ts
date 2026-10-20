import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { MAX_AVATAR_BYTES } from '@shared/defaults'

const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const

export interface AvatarService {
  directory: string
  save: (id: string, dataUrl: string) => string
  remove: (filename: string | null) => void
  removeForContact: (id: string) => void
  publicUrl: (filename: string | null) => string | null
  toDataUrl: (filename: string | null) => string | null
}

export function createAvatarService(): AvatarService {
  const directory = join(app.getPath('userData'), 'avatars')
  mkdirSync(directory, { recursive: true })

  return {
    directory,
    save: (id, dataUrl) => {
      const parsed = parseDataUrl(dataUrl)
      if (!parsed) throw new Error('invalidAvatar')
      mkdirSync(directory, { recursive: true })
      for (const extension of EXTENSIONS) {
        if (extension === parsed.extension) continue
        const stale = join(directory, `${id}.${extension}`)
        if (existsSync(stale)) unlinkSync(stale)
      }
      const filename = `${id}.${parsed.extension}`
      writeFileSync(join(directory, filename), parsed.bytes)
      return filename
    },
    remove: (filename) => {
      if (!filename || !isSafeFilename(filename)) return
      const path = resolve(directory, filename)
      if (!isInside(directory, path) || !existsSync(path)) return
      unlinkSync(path)
    },
    removeForContact: (id) => {
      for (const extension of EXTENSIONS) {
        const path = join(directory, `${id}.${extension}`)
        if (existsSync(path)) unlinkSync(path)
      }
    },
    publicUrl: (filename) => {
      if (!filename || !isSafeFilename(filename)) return null
      const path = resolve(directory, filename)
      if (!isInside(directory, path) || !existsSync(path)) return null
      return `birthdayly://avatar/${filename}`
    },
    toDataUrl: (filename) => {
      if (!filename || !isSafeFilename(filename)) return null
      const path = resolve(directory, filename)
      if (!isInside(directory, path) || !existsSync(path)) return null
      const bytes = readFileSync(path)
      if (bytes.byteLength > MAX_AVATAR_BYTES) return null
      const mime = filename.endsWith('.png') ? 'image/png' : filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      return `data:${mime};base64,${bytes.toString('base64')}`
    }
  }
}

function parseDataUrl(dataUrl: string): { extension: 'png' | 'jpg' | 'webp'; bytes: Buffer } | null {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/=\r\n]+)$/.exec(dataUrl)
  if (!match) return null
  const kind = match[1]
  const payload = match[2]
  if (!kind || !payload) return null
  const bytes = Buffer.from(payload.replace(/\s/g, ''), 'base64')
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_AVATAR_BYTES) return null
  const extension = kind === 'png' ? 'png' : kind === 'webp' ? 'webp' : 'jpg'
  return { extension, bytes }
}

function isSafeFilename(filename: string): boolean {
  return /^[0-9a-f-]{36}\.(png|jpe?g|webp)$/i.test(filename)
}

function isInside(directory: string, path: string): boolean {
  const fromRoot = relative(directory, path)
  return fromRoot.length > 0 && !fromRoot.startsWith('..') && !fromRoot.includes('/') && !fromRoot.includes('\\')
}
