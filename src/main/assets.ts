import { app, nativeImage, type NativeImage } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export function loadIcon(fileName: string): NativeImage {
  const candidates = [
    join(process.resourcesPath, fileName),
    join(app.getAppPath(), 'build', fileName),
    join(process.cwd(), 'build', fileName)
  ]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const image = nativeImage.createFromPath(candidate)
    if (!image.isEmpty()) return image
  }
  return nativeImage.createEmpty()
}
