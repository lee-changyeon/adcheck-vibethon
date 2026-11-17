import { sampleHistory } from '../data/sample'
import type { CheckRecord } from '../data/types'
import { useLocalStorage } from './useLocalStorage'

/** 점검 이력 (최신순). 처음 열면 시연용 샘플 이력이 들어 있다. */
export function useHistory() {
  return useLocalStorage<CheckRecord[]>('adcheck.history', sampleHistory())
}
