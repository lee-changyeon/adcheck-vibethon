// Claude Code UserPromptSubmit 훅: 내가 입력한 프롬프트를 전부 기록한다.
// - docs/프롬프트기록.md   : 사람이 읽는 기록 (보고서·발표용)
// - docs/prompt-log.jsonl : 분석용 기록 (scripts/analyze-prompts.mjs가 읽음)
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw.replace(/^﻿/, '').trim() || '{}')
    const prompt = String(input.prompt ?? '').trim()
    if (!prompt) return

    // 이 파일 위치(.claude/hooks/) 기준으로 프로젝트 폴더를 찾는다 (환경변수는 세션 이동 시 틀릴 수 있음)
    const root = fileURLToPath(new URL('../..', import.meta.url))
    const docs = join(root, 'docs')
    if (!existsSync(docs)) mkdirSync(docs, { recursive: true })

    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

    const jsonl = join(docs, 'prompt-log.jsonl')
    const count = existsSync(jsonl) ? readFileSync(jsonl, 'utf8').split('\n').filter(Boolean).length : 0
    const no = count + 1

    appendFileSync(
      jsonl,
      JSON.stringify({ no, ts: now.toISOString(), date, time, session: input.session_id ?? '', chars: prompt.length, prompt }) + '\n',
    )

    const md = join(docs, '프롬프트기록.md')
    if (!existsSync(md)) appendFileSync(md, '# 프롬프트 기록\n\n바이브코딩 과정에서 AI에게 입력한 프롬프트 전체 기록 (자동 생성)\n')
    const quoted = prompt.split('\n').map((l) => `> ${l}`).join('\n')
    appendFileSync(md, `\n### #${no} · ${date} ${time}\n\n${quoted}\n`)
  } catch {
    // 기록 실패가 작업을 막지 않도록 조용히 넘어간다
  }
})
