import { useEffect, useState } from 'react'

/** useState와 같지만 새로고침해도 값이 남는다 (브라우저 localStorage에 저장) */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? (JSON.parse(saved) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 저장 실패는 무시 (시크릿 모드 등) */
    }
  }, [key, value])

  return [value, setValue] as const
}

/** 바로 다른 화면으로 이동할 때: 화면이 닫히기 전에 저장까지 끝낸다 */
export function saveNow<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 저장 실패는 무시 (시크릿 모드 등) */
  }
}
