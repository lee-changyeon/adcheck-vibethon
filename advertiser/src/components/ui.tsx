import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, ComponentProps, InputHTMLAttributes, ReactNode } from 'react'

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
        className={`w-full min-w-0 rounded-3xl border-2 border-transparent bg-slate-100 in-data-[surface=soft]:bg-white px-5 py-3 text-base outline-none placeholder:text-slate-500 focus:border-slate-950 focus:bg-white focus:ring-[6px] focus:ring-slate-100 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Textarea({ label, className = '', ...props }: ComponentProps<'textarea'> & { label?: string }) {
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
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium transition active:opacity-50 ${
            value === o.value ? 'bg-slate-950 text-white' : 'bg-white text-slate-950 ring-1 ring-inset ring-slate-300 hover:ring-slate-950'
          }`}
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
    <div className="pointer-events-none fixed bottom-40 left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-medium text-white">
      {message}
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

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-500">
      {icon}
      <p className="font-semibold text-slate-950">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  )
}

/** 화면 아래에서 올라오는 시트 (추가/수정 폼 등에 사용) */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
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
