import { useState } from 'react'
import type { Application, CollabEvent, Creator, DmRecord } from '../data/collab'
import { SAMPLE_CREATORS, sampleCollab } from '../data/collabSample'
import { saveNow, useLocalStorage } from './useLocalStorage'

export const COLLAB_KEYS = ['adcheckbiz.creators', 'adcheckbiz.events', 'adcheckbiz.dms', 'adcheckbiz.applications']

/** 협업 기능 상태: 크리에이터 DB, 행사, DM 발송 기록, 신청자 */
export function useCollab() {
  const [sample] = useState(sampleCollab)
  const [creators, setCreators] = useLocalStorage<Creator[]>('adcheckbiz.creators', SAMPLE_CREATORS)
  const [events, setEvents] = useLocalStorage<CollabEvent[]>('adcheckbiz.events', sample.events)
  const [dms, setDms] = useLocalStorage<DmRecord[]>('adcheckbiz.dms', sample.dms)
  const [applications, setApplications] = useLocalStorage<Application[]>('adcheckbiz.applications', sample.applications)

  /** 행사 목록을 바꾸고 바로 저장 (저장 직후 다른 화면으로 이동할 때 사용) */
  const setEventsNow = (next: CollabEvent[]) => {
    saveNow('adcheckbiz.events', next)
    setEvents(next)
  }

  return { creators, setCreators, events, setEvents, setEventsNow, dms, setDms, applications, setApplications }
}
