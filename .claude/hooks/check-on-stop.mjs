// Claude Code Stop 훅: Claude가 작업을 끝낼 때 src가 바뀌었으면 `npm run check`를 돌린다.
// 실패하면 Claude에게 오류를 돌려보내 스스로 고치게 한다 (오류가 쌓이지 않게).
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let input = {}
  try {
    input = JSON.parse(raw.replace(/^﻿/, '').trim() || '{}')
  } catch {}
  // 이미 한 번 되돌려 보낸 뒤라면 무한 반복 방지
  if (input.stop_hook_active) return

  // 이 파일 위치(.claude/hooks/) 기준으로 프로젝트 폴더를 찾는다
  const root = fileURLToPath(new URL('../..', import.meta.url))
  const stamp = join(root, 'node_modules', '.last-check')

  const latest = (dir) => {
    let t = 0
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      t = Math.max(t, e.isDirectory() ? latest(p) : statSync(p).mtimeMs)
    }
    return t
  }
  const srcChanged = latest(join(root, 'src'))
  const lastOk = existsSync(stamp) ? Number(readFileSync(stamp, 'utf8')) : 0
  if (srcChanged <= lastOk) return // 바뀐 게 없으면 생략

  try {
    execSync('npm run check', { cwd: root, stdio: 'pipe', encoding: 'utf8' })
    writeFileSync(stamp, String(Date.now()))
  } catch (e) {
    const out = `${e.stdout ?? ''}\n${e.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n')
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason: `npm run check 실패. 아래 오류를 고친 뒤 다시 검사해 주세요.\n\n${out}`,
      }),
    )
  }
})
