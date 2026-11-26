import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, ComponentProps, InputHTMLAttributes, ReactNode } from 'react'

/* 공통 UI 부품. 새 화면은 가능하면 이 부품들로 조립한다.
   v4 디자인(크리에이터 앱과 같음): 민트 바탕 위 흰 둥근 카드, 청록 알약 버튼, 아주 큰 굵은 글자 */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-[0_10px_20px_-10px_var(--color-brand-700)] hover:bg-brand-700',
  secondary: 'bg-white text-slate-950 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold transition active:scale-[0.97] active:opacity-70 disabled:opacity-30 disabled:shadow-none ${BUTTON_STYLES[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-2xl bg-white p-5 shadow-sm ${onClick ? 'cursor-pointer transition active:scale-[0.99] active:opacity-70' : ''} ${className}`}>
      {children}
    </div>
  )
}

/** 입력 칸 공통 모양 (흰 바탕 + 연한 테두리, 누르면 청록 테두리) */
export const FIELD =
  'w-full min-w-0 rounded-2xl bg-white text-base outline-none ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600'

export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>}
      <input className={`${FIELD} px-5 py-3 ${className}`} {...props} />
    </label>
  )
}

export function Textarea({ label, className = '', ...props }: ComponentProps<'textarea'> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-slate-900">{label}</span>}
      <textarea className={`${FIELD} resize-none px-5 py-4 ${className}`} {...props} />
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

const CHIP_ON = 'bg-brand-600 font-bold text-white shadow-[0_8px_16px_-10px_var(--color-brand-700)]'
const CHIP_OFF = 'bg-white font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:ring-brand-400'

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
          className={`min-h-11 rounded-full px-2 py-2.5 text-sm transition active:opacity-70 ${value === o.value ? CHIP_ON : CHIP_OFF}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** 가로로 넘기는 필터 칩 (분야 필터 등). 항목 수가 많아도 한 줄로 */
export function ScrollChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm transition active:opacity-70 ${value === o.value ? CHIP_ON : CHIP_OFF}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** 화면 아래쪽에 잠깐 떴다 사라지는 안내 문구. message가 빈 문자열이면 숨김 */
export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="pointer-events-none fixed bottom-40 left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-3 text-center text-sm font-bold text-white shadow-lg">
      {message}
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

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-500">
      {icon}
      <p className="mt-2 text-lg font-extrabold text-slate-950">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  )
}

/** 작은 알약 라벨 (히어로 위 「캠페인 검수」 같은 표시) */
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

/** 화면 맨 위 히어로: 민트 그라데이션 + 알약 라벨 + 큰 두 색 제목 + 설명 + 오른쪽 일러스트 */
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

/** 화면 아래에서 올라오는 시트 (추가/수정 폼 등에 사용) */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-brand-50 p-5 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
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
