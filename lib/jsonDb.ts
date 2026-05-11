import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureFile(filePath: string, defaultValue: unknown[] = []) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2))
}

export function readJson<T>(fileName: string): T[] {
  const filePath = path.join(DATA_DIR, fileName)
  ensureFile(filePath)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T[]
}

export function writeJson<T>(fileName: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, fileName)
  ensureFile(filePath)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
