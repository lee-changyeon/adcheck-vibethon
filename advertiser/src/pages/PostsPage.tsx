import { Check, ClipboardList, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CampaignSwitcher, IssueList, StatusBadge, VerdictBadge } from '../components/BizParts'
import { DocArt } from '../components/Art'
import { BottomSheet, Button, Card, ChoiceChips, EmptyState, Fab, HeroType, Input, PageHero, Pill, SectionTitle, Textarea } from '../components/ui'
import { type ActionStatus, buildRequestMessage, type Campaign, evaluate, needsAction, newId, normalizeHandle, type Post, STATUS_LABEL } from '../data/biz'
import { PLATFORM_LABEL, type Platform } from '../data/types'
import { useBiz } from '../hooks/useBiz'
import { copyText } from '../lib/clipboard'

type Filter = 'all' | 'todo' | 'done'
const PLATFORMS = (Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))
const STATUSES = (Object.keys(STATUS_LABEL) as ActionStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))

/** 기능 ②③: 게시물 일괄 검수 + 수정 요청 */
export default function PostsPage() {
  const { campaigns, current, currentPosts, setPosts, setCurrentId } = useBiz()
  const location = useLocation()
  const [openId, setOpenId] = useState<string | null>(() => (location.state as { openId?: string } | null)?.openId ?? null)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  if (!current) {
    return <EmptyState icon={<ClipboardList size={40} />} title="캠페인이 없어요" description="캠페인 탭에서 캠페인을 먼저 등록해 주세요" />
  }

  const rows = currentPosts.map((p) => ({ post: p, result: evaluate(p, current) }))
  const todoCount = rows.filter((r) => needsAction(r.result, r.post.status)).length
  const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'todo' ? needsAction(r.result, r.post.status) : !needsAction(r.result, r.post.status)))
  const open = currentPosts.find((p) => p.id === openId) ?? null

  const updatePost = (id: string, patch: Partial<Post>) =>
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)))

  return (
    <div className="space-y-4">
      <PageHero
        pills={
          <>
            <Pill>붙여넣으면 바로 판정</Pill>
          </>
        }
        title={
          <>
            <HeroType>
              <span className="text-brand-sky">게시물</span>
            </HeroType>
            <br />
            <HeroType><span className="text-brand-500">일괄</span> 검수</HeroType>
          </>
        }
        art={<DocArt className="-rotate-6" />}
      />
      <div className="relative -mt-12">
        <CampaignSwitcher campaigns={campaigns} value={current.id} onChange={setCurrentId} />
      </div>
      <ChoiceChips
        options={[
          { value: 'all', label: `전체 ${rows.length}` },
          { value: 'todo', label: `조치 필요 ${todoCount}` },
          { value: 'done', label: `문제 없음 ${rows.length - todoCount}` },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {shown.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title={rows.length === 0 ? '등록된 게시물이 없어요' : '해당하는 게시물이 없어요'}
          description={rows.length === 0 ? '오른쪽 아래 + 버튼으로 인플루언서 게시물을 붙여넣으세요' : undefined}
        />
      ) : (
        <div className="space-y-2">
          {shown.map(({ post, result }) => (
            <Card key={post.id} onClick={() => setOpenId(post.id)} className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-black text-brand-800">{result.score}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{post.influencer}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {PLATFORM_LABEL[post.platform]} · {post.text.trim().split('\n')[0]}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <VerdictBadge verdict={result.verdict} />
                {result.verdict !== '적합' && <StatusBadge status={post.status} />}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Fab onClick={() => setAdding(true)} label="게시물 등록">
        <Plus size={26} />
      </Fab>

      <AddPostSheet
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(influencer, platform, text) => {
          const post: Post = { id: newId(), campaignId: current.id, influencer, platform, text, status: 'open', updatedAt: new Date().toISOString() }
          setPosts((ps) => [post, ...ps])
          setAdding(false)
          setFilter('all')
          setOpenId(post.id)
        }}
      />

      <BottomSheet open={open !== null} onClose={() => setOpenId(null)} title={open ? `${open.influencer} 게시물 검수` : ''}>
        {open && (
          <PostDetail
            key={open.id}
            post={open}
            campaign={current}
            onUpdate={(patch) => updatePost(open.id, patch)}
            onDelete={() => {
              setPosts((ps) => ps.filter((p) => p.id !== open.id))
              setOpenId(null)
            }}
          />
        )}
      </BottomSheet>
    </div>
  )
}

function AddPostSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (influencer: string, platform: Platform, text: string) => void }) {
  const [handle, setHandle] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [text, setText] = useState('')
  const valid = normalizeHandle(handle) && text.trim()

  return (
    <BottomSheet open={open} onClose={onClose} title="게시물 등록">
      <div className="max-h-[75svh] space-y-4 overflow-y-auto">
        <Input label="인플루언서 계정" placeholder="예: @daegu_foodie" value={handle} onChange={(e) => setHandle(e.target.value)} />
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-600">플랫폼</p>
          <ChoiceChips options={PLATFORMS} value={platform} onChange={setPlatform} />
        </div>
        <Textarea
          label={platform === 'instagram' ? '게시물 글 (본문 + 해시태그)' : '게시물 글 (첫 줄은 제목)'}
          rows={7}
          placeholder="인플루언서가 올린 글을 그대로 복사해 붙여넣으세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          full
          disabled={!valid}
          onClick={() => {
            onAdd(normalizeHandle(handle), platform, text.trim())
            setHandle('')
            setText('')
          }}
        >
          등록하고 검수하기
        </Button>
      </div>
    </BottomSheet>
  )
}

function PostDetail({ post, campaign, onUpdate, onDelete }: { post: Post; campaign: Campaign; onUpdate: (patch: Partial<Post>) => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false)
  const [revised, setRevised] = useState('')
  const result = evaluate(post, campaign)
  const message = result.verdict === '적합' ? '' : buildRequestMessage(post, campaign, result)

  const copyMessage = async () => {
    const ok = await copyText(message)
    if (!ok) {
      alert('복사하지 못했어요. 메시지를 길게 눌러 직접 복사해 주세요.')
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (post.status === 'open') onUpdate({ status: 'requested' })
  }

  const recheck = () => {
    const text = revised.trim()
    if (!text) return
    const next = evaluate({ ...post, text }, campaign)
    onUpdate({ text, status: next.verdict === '적합' ? 'resolved' : post.status })
    setRevised('')
  }

  return (
    <div className="max-h-[75svh] space-y-5 overflow-y-auto pb-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{result.score}점</span>
        <VerdictBadge verdict={result.verdict} />
        <span className="ml-auto text-xs text-slate-400">{PLATFORM_LABEL[post.platform]}</span>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-600">게시물 글</p>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap bg-slate-100 p-4 font-sans text-sm leading-relaxed">{post.text}</pre>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-slate-600">검수 결과</p>
        <IssueList issues={result.issues} />
      </div>

      {message && (
        <>
          <div>
            <SectionTitle>수정 요청 메시지</SectionTitle>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap bg-slate-100 p-4 font-sans text-sm leading-relaxed">{message}</pre>
            <Button full className="mt-2" onClick={copyMessage}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? '복사됨 · 수정 요청함으로 표시' : '메시지 복사 (DM·카톡으로 전달)'}
            </Button>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-slate-600">조치 상태</p>
            <ChoiceChips options={STATUSES} value={post.status} onChange={(status) => onUpdate({ status })} />
          </div>

          <div className="space-y-2">
            <Textarea
              label="인플루언서가 고친 글 붙여넣기"
              rows={4}
              placeholder="수정된 게시물 글을 붙여넣으면 다시 검수해요"
              value={revised}
              onChange={(e) => setRevised(e.target.value)}
            />
            <Button variant="secondary" full disabled={!revised.trim()} onClick={recheck}>
              <RefreshCw size={16} /> 수정본 다시 검수
            </Button>
          </div>
        </>
      )}

      <Button variant="ghost" full onClick={onDelete} className="text-red-600">
        <Trash2 size={16} /> 게시물 삭제
      </Button>
    </div>
  )
}
