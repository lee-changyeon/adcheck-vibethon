import { useEffect, useRef, useState } from 'react'

/** 잠깐 보여 줄 안내 문구. show('복사했어요') → 2초 뒤 사라짐 */
export function useToast(ms = 2000) {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const show = (text: string) => {
    window.clearTimeout(timer.current)
    setMessage(text)
    timer.current = window.setTimeout(() => setMessage(''), ms)
  }
  return { message, show }
}
