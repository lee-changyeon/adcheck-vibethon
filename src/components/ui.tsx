import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* 공통 UI 부품. 새 화면은 가능하면 이 부품들로 조립한다. */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-slate-100 text-slate-950 hover:bg-slate-200',
  ghost: 'text-slate-900 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({
  variant = 'primary',
  full,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; full?: boolean }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium transition active:scale-[0.97] active:opacity-50 disabled:opacity-30 ${BUTTON_STYLES[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      data-surface="soft"
      className={`bg-slate-100 p-5 ${onClick ? 'cursor-pointer transition active:opacity-60' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-slate-900">{label}</span>}
      <input
        className={`w-full rounded-3xl border-2 border-transparent bg-slate-100 in-data-[surface=soft]:bg-white px-5 py-3 text-base outline-none placeholder:text-slate-500 focus:border-slate-950 focus:bg-white focus:ring-[6px] focus:ring-slate-100 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Textarea({ label, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-slate-900">{label}</span>}
      <textarea
        className={`w-full resize-none rounded-3xl border-2 border-transparent bg-slate-100 in-data-[surface=soft]:bg-white px-5 py-4 text-base outline-none placeholder:text-slate-500 focus:border-slate-950 focus:bg-white focus:ring-[6px] focus:ring-slate-100 ${className}`}
        {...props}
      />
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
      {label && <span className="mb-2 block text-sm font-medium text-slate-900">{label}</span>}
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-12 w-full appearance-none rounded-3xl border-2 border-transparent bg-slate-100 in-data-[surface=soft]:bg-white py-3 pr-12 pl-5 text-base outline-none focus:border-slate-950 focus:bg-white focus:ring-[6px] focus:ring-slate-100 ${
            value ? 'text-slate-950' : 'text-slate-500'
          }`}
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
        <ChevronDown size={20} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-950" />
      </span>
    </label>
  )
}

export type BadgeColor = 'brand' | 'green' | 'amber' | 'red' | 'slate'
export function Badge({ children, color = 'brand' }: { children: ReactNode; color?: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    brand: 'bg-white text-slate-950 ring-1 ring-inset ring-slate-300',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-white text-slate-500 ring-1 ring-inset ring-slate-300',
  }
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${styles[color]}`}>{children}</span>
}

/** 0~100 진행률 막대 */
export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/** 떠 있는 + 버튼 (하단 탭 위 오른쪽) */
export function Fab({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 left-1/2 z-20 ml-[min(calc(50vw-4.5rem),9.5rem)] flex size-14 items-center justify-center rounded-full bg-brand-600 text-white transition active:scale-95 active:opacity-50"
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
          className={`min-h-11 rounded-full px-2 py-2.5 text-sm font-medium transition active:opacity-50 ${
            value === o.value ? 'bg-slate-950 text-white' : 'bg-white text-slate-950 ring-1 ring-inset ring-slate-300 hover:ring-slate-950'
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
      <h2 className="text-xl font-semibold text-slate-950">{children}</h2>
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
      <p className="font-semibold text-slate-950">{title}</p>
      {description && <p className="text-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/** 다른 화면으로 들어가는 메뉴 카드 (아이콘 + 제목 + 설명 + 오른쪽 화살표) */
export function MenuCard({
  to,
  icon,
  title,
  description,
  meta,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
  /** 제목 옆 작은 정보 (예: 7건) */
  meta?: string
}) {
  return (
    <Link to={to} className="flex min-h-18 items-center gap-4 border-b border-slate-300 py-4 transition active:opacity-50">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-950">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-slate-950">{title}</span>
          {meta && <span className="rounded-full px-2 py-0.5 text-xs font-medium text-slate-950 ring-1 ring-inset ring-slate-300">{meta}</span>}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-slate-500">{description}</span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-slate-950" />
    </Link>
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
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-950 active:opacity-50" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
