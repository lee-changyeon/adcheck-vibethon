import type { CheckRecord } from '../data/types'
import { useLocalStorage } from './useLocalStorage'

/** 점검 이력 (최신순). 처음에는 비어 있다. */
export function useHistory() {
  return useLocalStorage<CheckRecord[]>('adcheck.history', [])
}
