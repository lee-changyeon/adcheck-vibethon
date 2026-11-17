import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

/* 공통 UI 부품. 새 화면은 가능하면 이 부품들로 조립한다. */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-slate-200 text-slate-950 hover:bg-slate-300',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

export function Button({
  variant = 'primary',
  full,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; full?: boolean }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 ${BUTTON_STYLES[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white p-4 ring-1 ring-slate-200 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Textarea({ label, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
      <textarea
        className={`w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
    </label>
  )
}

export type BadgeColor = 'brand' | 'green' | 'amber' | 'red' | 'slate'
export function Badge({ children, color = 'brand' }: { children: ReactNode; color?: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    brand: 'bg-slate-200 text-slate-950',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[color]}`}>{children}</span>
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
      className="fixed bottom-24 left-1/2 z-20 ml-[min(calc(50vw-4.5rem),9.5rem)] flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg active:scale-95"
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
          className={`min-h-11 rounded-full px-2 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
            value === o.value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
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
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight text-slate-950">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-400">
      {icon}
      <p className="font-semibold text-slate-600">{title}</p>
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
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
