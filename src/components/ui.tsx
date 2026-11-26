import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* 공통 UI 부품. 새 화면은 가능하면 이 부품들로 조립한다.
   v4 디자인: 민트 바탕 위 흰 둥근 카드, 청록 알약 버튼, 아주 큰 굵은 글자 */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-[0_10px_20px_-10px_var(--color-brand-700)] hover:bg-brand-700',
  secondary: 'bg-white text-slate-950 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-900 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}
const BUTTON_BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold transition active:scale-[0.97] active:opacity-70'

export function Button({
  variant = 'primary',
  full,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; full?: boolean }) {
  return (
    <button
      className={`${BUTTON_BASE} disabled:opacity-30 disabled:shadow-none ${BUTTON_STYLES[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

/** 다른 화면으로 가는 버튼 모양 링크 (Button과 같은 모양) */
export function LinkButton({
  to,
  variant = 'primary',
  className = '',
  children,
}: {
  to: string
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={`${BUTTON_BASE} ${BUTTON_STYLES[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-2xl bg-white p-5 shadow-sm ${onClick ? 'cursor-pointer transition active:scale-[0.99] active:opacity-70' : ''} ${className}`}>
      {children}
    </div>
  )
}

const FIELD =
  'w-full rounded-2xl bg-white text-base outline-none ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600'

export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>}
      <input className={`${FIELD} px-5 py-3 ${className}`} {...props} />
    </label>
  )
}

export function Textarea({ label, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>}
      <textarea className={`${FIELD} resize-none px-5 py-4 ${className}`} {...props} />
    </label>
  )
}

/** 드롭다운 선택 상자 (휴대폰 기본 선택 창을 써서 손가락으로 고르기 쉽다) */
export function Select({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label?: string
  /** 아무것도 고르지 않았을 때 보이는 안내 문구 */
  placeholder?: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>}
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} min-h-12 appearance-none py-3 pr-12 pl-5 ${value ? 'text-slate-950' : 'text-slate-500'}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-slate-950">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={20} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-brand-700" />
      </span>
    </label>
  )
}

export type BadgeColor = 'brand' | 'green' | 'amber' | 'red' | 'slate'
export function Badge({ children, color = 'brand' }: { children: ReactNode; color?: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    brand: 'bg-brand-100 text-brand-800',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${styles[color]}`}>{children}</span>
}

/** 0~100 진행률 막대 */
export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/** 떠 있는 + 버튼 (하단 탭 위 오른쪽) */
export function Fab({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 left-1/2 z-20 ml-[min(calc(50vw-4.5rem),9.5rem)] flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition active:scale-95 active:opacity-70"
    >
      {children}
    </button>
  )
}

/** 여러 개 중 하나를 고르는 칩 버튼 묶음 */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  cols = 3,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  cols?: 2 | 3 | 4
}) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[cols]
  return (
    <div className={`grid gap-2 ${grid}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-full px-2 py-2.5 text-sm transition active:opacity-70 ${
            value === o.value
              ? 'bg-brand-600 font-bold text-white shadow-[0_8px_16px_-10px_var(--color-brand-700)]'
              : 'bg-white font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:ring-brand-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-slate-950">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  /** 빈 화면에서 바로 할 일 (예: 점검하러 가기 버튼) */
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-500">
      {icon}
      <p className="mt-2 text-lg font-extrabold text-slate-950">{title}</p>
      {description && <p className="text-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/** 둥근 썸네일 + 굵은 제목 + 색 있는 부제 목록 한 줄. to가 있으면 그 화면으로 이동한다 */
export function ListRow({
  to,
  thumb,
  title,
  subtitle,
  tone = 'brand',
  meta,
}: {
  to?: string
  /** 왼쪽 둥근 썸네일 안에 넣을 그림 */
  thumb: ReactNode
  title: string
  subtitle: string
  /** 부제 색: 청록(brand) · 파랑(sky) */
  tone?: 'brand' | 'sky'
  /** 제목 옆 작은 정보 (예: 7건) */
  meta?: string
}) {
  const body = (
    <>
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-slate-100">{thumb}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[17px] font-extrabold tracking-[-0.01em] text-slate-950">{title}</span>
          {meta && <Badge>{meta}</Badge>}
        </span>
        <span className={`mt-1 block text-sm leading-snug font-bold ${tone === 'sky' ? 'text-brand-sky' : 'text-brand-700'}`}>{subtitle}</span>
      </span>
      {to && <ChevronRight size={20} className="shrink-0 text-slate-400" />}
    </>
  )
  return to ? (
    <Link to={to} className="flex min-h-20 items-center gap-4 py-3 transition active:opacity-60">
      {body}
    </Link>
  ) : (
    <div className="flex min-h-20 items-center gap-4 py-3">{body}</div>
  )
}

/** 작은 알약 라벨 (히어로 위 「30초」 같은 표시) */
export function Pill({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'sky' | 'ink' }) {
  const styles = {
    brand: 'bg-white/80 text-brand-700 ring-brand-400',
    sky: 'bg-white/80 text-brand-sky ring-brand-sky-light',
    ink: 'bg-slate-900 text-white ring-slate-900',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-sm font-extrabold ring-2 ring-inset ${styles}`}>{children}</span>
}

/** 아주 큰 굵은 글자. 뒤에 흰 테두리 글자를 한 벌 깔아 입체처럼 보이게 한다 */
export function HeroType({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block font-black ${className}`}>
      <span aria-hidden className="hero-type-back absolute inset-0 select-none">
        {children}
      </span>
      <span className="hero-type relative">{children}</span>
    </span>
  )
}

/** 본문 화면 맨 위 히어로: 민트 그라데이션 + 알약 라벨 + 큰 두 색 제목 + 설명 + 오른쪽 일러스트 */
export function PageHero({ pills, title, desc, art }: { pills?: ReactNode; title: ReactNode; desc?: string; art?: ReactNode }) {
  return (
    <section className="relative -mx-5 -mt-5 overflow-hidden bg-linear-to-b from-brand-100 to-brand-50 px-5 pt-6 pb-8">
      {art && <div className="bob-slow pointer-events-none absolute top-5 right-3 w-28">{art}</div>}
      {pills && <div className="relative flex flex-wrap gap-1.5">{pills}</div>}
      <h2 className="relative mt-4 text-[46px] leading-[1.05] text-slate-800">{title}</h2>
      {desc && <p className="relative mt-4 max-w-[20rem] text-[15px] leading-relaxed font-medium text-slate-600">{desc}</p>}
    </section>
  )
}

/** 알약형 강조 띠 (화면 아래 한 줄 안내) */
export function Banner({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-brand-100 py-2 pr-5 pl-2 text-[15px] font-bold text-slate-800">
      {icon && <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">{icon}</span>}
      <span className="min-w-0 leading-snug">{children}</span>
    </div>
  )
}

/** 시트가 열릴 때 방문 기록에 넣는 표시. 휴대폰 뒤로 가기를 누르면 화면 이동 대신 시트만 닫는다 */
const SHEET_STATE = 'adcheckSheet'

/** 화면 아래에서 올라오는 시트 (추가/수정 폼 등에 사용) */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    window.history.pushState({ ...window.history.state, [SHEET_STATE]: true }, '')
    const onPop = (e: PopStateEvent) => {
      if (!e.state?.[SHEET_STATE]) onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // 닫기 버튼 등으로 닫았으면 넣어 둔 기록 한 칸을 되돌린다
      if (window.history.state?.[SHEET_STATE]) window.history.back()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-brand-50 p-5 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm active:opacity-60" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
