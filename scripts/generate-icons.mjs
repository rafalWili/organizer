import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = join(root, 'build')

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x, y, size)
      const index = row + 1 + x * 4
      raw[index] = r
      raw[index + 1] = g
      raw[index + 2] = b
      raw[index + 3] = a
    }
  }
  const compressed = deflateSync(raw)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', ihdr(size)), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

function ihdr(size) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  return header
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc(body), 8 + data.length)
  return out
}

function crc(buffer) {
  let value = 0xffffffff
  for (const byte of buffer) {
    value ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0)
    }
  }
  return (value ^ 0xffffffff) >>> 0
}

function cake(x, y, size) {
  const nx = (x + 0.5) / size - 0.5
  const ny = (y + 0.5) / size - 0.5
  const outside = rounded(nx, ny, 0.42, 0.18)
  if (outside > 0) return [0, 0, 0, 0]
  const cakeBody = Math.abs(nx) < 0.16 && ny > -0.02 && ny < 0.2
  const frosting = Math.abs(nx) < 0.16 && ny > -0.08 && ny < 0.02
  const candle = Math.abs(nx) < 0.025 && ny > -0.24 && ny < -0.02
  const flame = Math.hypot(nx, ny + 0.28) < 0.045
  if (flame) return [245, 158, 11, 255]
  if (candle) return [255, 255, 255, 255]
  if (frosting) return [253, 230, 138, 255]
  if (cakeBody) return [255, 247, 237, 255]
  return [79, 70, 229, 255]
}

function rounded(nx, ny, half, radius) {
  const qx = Math.abs(nx) - half + radius
  const qy = Math.abs(ny) - half + radius
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function ico(pngBuffer) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(0, 0)
  entry.writeUInt8(0, 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, pngBuffer])
}

mkdirSync(buildDir, { recursive: true })
const large = png(512, cake)
const windows = png(256, cake)
writeFileSync(join(buildDir, 'icon.png'), large)
writeFileSync(join(buildDir, 'tray.png'), png(32, cake))
writeFileSync(join(buildDir, 'icon.ico'), ico(windows))
console.log('Wrote build/icon.png, build/tray.png and build/icon.ico')
