import { useId } from 'react'

/* 애드체크 자체 입체(3D 느낌) 일러스트. 외부 이미지 없이 SVG 그라데이션으로 그린다.
   색은 모두 index.css @theme 변수(brand-*, slate-*)에서 가져온다. */

type ArtProps = { className?: string }

const v = (name: string) => `var(--color-${name})`
/** 같은 색을 흰색과 섞어 밝은 면(하이라이트)을 만든다 */
const light = (name: string, pct = 55) => `color-mix(in oklab, var(--color-${name}) ${pct}%, white)`
/** 같은 색을 검정과 섞어 어두운 면(그늘)을 만든다 */
const dark = (name: string, pct = 78) => `color-mix(in oklab, var(--color-${name}) ${pct}%, black)`

/** 아래로 떨어지는 부드러운 그림자 (모든 일러스트 공통) */
const SHADOW = 'drop-shadow-[0_10px_10px_rgb(18_53_47/0.22)]'

function Grad({ id, from, to, x2 = 0, y2 = 1 }: { id: string; from: string; to: string; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" style={{ stopColor: from }} />
      <stop offset="1" style={{ stopColor: to }} />
    </linearGradient>
  )
}

/** 휴대폰 화면에 올린 협찬 글 + #광고 표시 */
export function PhoneArt({ className = '' }: ArtProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 124" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}b`} from={v('slate-700')} to={v('slate-950')} x2={1} />
        <Grad id={`${id}s`} from="#ffffff" to={v('brand-100')} />
        <Grad id={`${id}p`} from={v('brand-sky-light')} to={v('brand-sky')} x2={1} />
        <Grad id={`${id}t`} from={light('brand-coral', 70)} to={v('brand-coral')} />
      </defs>
      <rect x="14" y="4" width="66" height="114" rx="16" fill={`url(#${id}b)`} />
      <rect x="19" y="10" width="56" height="102" rx="11" fill={`url(#${id}s)`} />
      <rect x="38" y="13" width="18" height="4" rx="2" fill={v('slate-900')} />
      <rect x="24" y="24" width="46" height="36" rx="7" fill={`url(#${id}p)`} />
      <circle cx="35" cy="36" r="5" fill={v('brand-sun-light')} />
      <path d="M24 54 L38 42 L48 50 L56 44 L70 56 L70 60 L24 60Z" fill="#ffffff" opacity="0.55" />
      <rect x="24" y="66" width="40" height="5" rx="2.5" fill={v('slate-300')} />
      <rect x="24" y="75" width="30" height="5" rx="2.5" fill={v('slate-200')} />
      <rect x="24" y="84" width="36" height="5" rx="2.5" fill={v('slate-200')} />
      {/* 화면 밖으로 튀어나온 #광고 표시 */}
      <g transform="rotate(-10 72 92)">
        <rect x="46" y="80" width="52" height="24" rx="12" fill={dark('brand-coral')} />
        <rect x="46" y="77" width="52" height="24" rx="12" fill={`url(#${id}t)`} />
        <text x="72" y="94" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff">
          #광고
        </text>
      </g>
      <path d="M22 16 Q 28 12 40 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none" />
    </svg>
  )
}

/** 체크 표시가 있는 방패 (안전하게 통과) */
export function ShieldArt({ className = '' }: ArtProps) {
  const id = useId()
  const shape = 'M50 6 L88 20 V52 C88 78 70 96 50 104 C30 96 12 78 12 52 V20 Z'
  return (
    <svg viewBox="0 0 100 112" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}o`} from={v('brand-400')} to={v('brand-700')} x2={1} />
        <Grad id={`${id}i`} from={light('brand-300', 60)} to={v('brand-500')} />
      </defs>
      <path d={shape} transform="translate(0 4)" fill={dark('brand-700', 70)} />
      <path d={shape} fill={`url(#${id}o)`} />
      <path d={shape} transform="translate(50 55) scale(0.8) translate(-50 -55)" fill={`url(#${id}i)`} />
      <path d="M33 54 L45 66 L69 40" stroke={dark('brand-800', 80)} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0 3)" opacity="0.25" />
      <path d="M33 54 L45 66 L69 40" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="36" cy="26" rx="14" ry="6" transform="rotate(-20 36 26)" fill="#fff" opacity="0.45" />
    </svg>
  )
}

/** # 해시태그 말풍선 */
export function BubbleArt({ className = '', label = '#' }: ArtProps & { label?: string }) {
  const id = useId()
  const shape = 'M20 8 H80 A16 16 0 0 1 96 24 V56 A16 16 0 0 1 80 72 H44 L26 88 L30 72 H20 A16 16 0 0 1 4 56 V24 A16 16 0 0 1 20 8Z'
  return (
    <svg viewBox="0 0 100 96" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}g`} from={v('brand-sky-light')} to={v('brand-sky')} x2={0.6} />
      </defs>
      <path d={shape} transform="translate(0 4)" fill={dark('brand-sky', 70)} />
      <path d={shape} fill={`url(#${id}g)`} />
      <text x="50" y={label.length > 1 ? 50 : 58} textAnchor="middle" fontSize={label.length > 1 ? 22 : 46} fontWeight="900" fill="#fff">
        {label}
      </text>
      <ellipse cx="28" cy="20" rx="13" ry="5" transform="rotate(-12 28 20)" fill="#fff" opacity="0.5" />
    </svg>
  )
}

/** 노란 돋보기 (점검) */
export function MagnifierArt({ className = '' }: ArtProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}r`} from={v('brand-sun-light')} to={v('brand-sun')} x2={1} />
        <Grad id={`${id}h`} from={v('brand-coral')} to={dark('brand-coral', 75)} x2={1} />
        <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" style={{ stopColor: light('brand-sky', 35) }} />
        </radialGradient>
      </defs>
      <path d="M62 62 L88 88" stroke={`url(#${id}h)`} strokeWidth="16" strokeLinecap="round" />
      <circle cx="42" cy="42" r="32" fill={`url(#${id}r)`} />
      <circle cx="42" cy="42" r="22" fill={`url(#${id}g)`} />
      <path d="M31 43 L39 51 L54 35" stroke={v('brand-600')} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="30" cy="22" rx="10" ry="4" transform="rotate(-30 30 22)" fill="#fff" opacity="0.7" />
    </svg>
  )
}

/** 표 모양 협찬 딱지 (#협찬) */
export function TagArt({ className = '', label = '#협찬' }: ArtProps & { label?: string }) {
  const id = useId()
  const shape = 'M10 18 H78 L94 40 L78 62 H10 A8 8 0 0 1 2 54 V26 A8 8 0 0 1 10 18Z'
  return (
    <svg viewBox="0 0 100 74" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}g`} from={v('brand-sun-light')} to={v('brand-sun')} />
      </defs>
      <path d={shape} transform="translate(0 4)" fill={dark('brand-sun', 72)} />
      <path d={shape} fill={`url(#${id}g)`} />
      <circle cx="80" cy="40" r="5" fill="#fff" />
      <text x="40" y="47" textAnchor="middle" fontSize="19" fontWeight="900" fill={v('slate-900')}>
        {label}
      </text>
      <rect x="10" y="22" width="40" height="4" rx="2" fill="#fff" opacity="0.6" />
    </svg>
  )
}

/** 반짝이 (4갈래 별) */
export function Sparkle({ className = '', color = 'brand-sun' }: ArtProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={v(color)} />
    </svg>
  )
}

/** 파란 문서 + 시계 (이력) */
export function DocArt({ className = '' }: ArtProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}d`} from={v('brand-sky-light')} to={v('brand-sky')} x2={0.7} />
        <Grad id={`${id}c`} from={v('brand-400')} to={v('brand-700')} />
      </defs>
      <path d="M18 8 H58 L78 28 V84 A8 8 0 0 1 70 92 H18 A8 8 0 0 1 10 84 V16 A8 8 0 0 1 18 8Z" fill={`url(#${id}d)`} />
      <path d="M58 8 V22 A6 6 0 0 0 64 28 H78Z" fill="#fff" opacity="0.55" />
      <rect x="20" y="38" width="36" height="6" rx="3" fill="#fff" opacity="0.9" />
      <rect x="20" y="52" width="26" height="6" rx="3" fill="#fff" opacity="0.7" />
      <circle cx="70" cy="72" r="20" fill={`url(#${id}c)`} />
      <circle cx="70" cy="72" r="14" fill="#fff" />
      <path d="M70 63 V72 L77 76" stroke={v('brand-700')} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/** 올라가는 막대 그래프 (통계) */
export function ChartArt({ className = '' }: ArtProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}a`} from={v('brand-coral-light')} to={light('brand-coral', 70)} />
        <Grad id={`${id}b`} from={v('brand-coral')} to={dark('brand-coral', 80)} x2={1} />
      </defs>
      <rect x="10" y="60" width="20" height="30" rx="5" fill={`url(#${id}a)`} />
      <rect x="40" y="44" width="20" height="46" rx="5" fill={`url(#${id}a)`} />
      <rect x="70" y="28" width="20" height="62" rx="5" fill={`url(#${id}a)`} />
      <path d="M12 52 L40 34 L56 40 L86 14" stroke={`url(#${id}b)`} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M72 12 L90 10 L88 28Z" fill={v('brand-coral')} stroke={v('brand-coral')} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

/** 노란 책 (가이드) */
export function BookArt({ className = '' }: ArtProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={`${SHADOW} ${className}`} aria-hidden>
      <defs>
        <Grad id={`${id}c`} from={v('brand-sun-light')} to={v('brand-sun')} x2={1} />
      </defs>
      <path d="M20 14 H78 A6 6 0 0 1 84 20 V86 H26 A10 10 0 0 1 16 76 V18 A4 4 0 0 1 20 14Z" fill={dark('brand-sun', 75)} />
      <path d="M26 74 H84 V88 H26 A7 7 0 0 1 26 74Z" fill="#fff" />
      <path d="M20 10 H76 A6 6 0 0 1 82 16 V74 H26 A10 10 0 0 0 16 84 V14 A4 4 0 0 1 20 10Z" fill={`url(#${id}c)`} />
      <path d="M38 36 L46 44 L62 28" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="34" y="54" width="32" height="5" rx="2.5" fill="#fff" opacity="0.75" />
    </svg>
  )
}
