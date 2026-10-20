import { protocol } from 'electron'
import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import type { AvatarService } from '../services/avatarService'

export function registerPrivilegedSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'birthdayly',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

export function installAvatarProtocol(avatars: AvatarService): void {
  protocol.handle('birthdayly', async (request) => {
    try {
      const url = new URL(request.url)
      if (url.hostname !== 'avatar') return new Response('Not found', { status: 404 })
      const filename = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
      if (!/^[0-9a-f-]{36}\.(png|jpe?g|webp)$/i.test(filename)) {
        return new Response('Bad request', { status: 400 })
      }
      const path = resolve(avatars.directory, filename)
      const fromRoot = relative(avatars.directory, path)
      if (fromRoot.startsWith('..') || fromRoot.includes('/') || fromRoot.includes('\\')) {
        return new Response('Forbidden', { status: 403 })
      }
      const bytes = await readFile(path)
      const type = filename.endsWith('.png') ? 'image/png' : filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      return new Response(bytes, {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'no-store'
        }
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}
