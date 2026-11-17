import type { Campaign, Post } from '../data/biz'
import { SAMPLE_CAMPAIGNS, samplePosts } from '../data/sample'
import { useLocalStorage } from './useLocalStorage'

/** 광고주 앱 상태: 캠페인 목록, 게시물 목록, 지금 보고 있는 캠페인 */
export function useBiz() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('adcheckbiz.campaigns', SAMPLE_CAMPAIGNS)
  const [posts, setPosts] = useLocalStorage<Post[]>('adcheckbiz.posts', samplePosts())
  const [currentId, setCurrentId] = useLocalStorage<string>('adcheckbiz.current', SAMPLE_CAMPAIGNS[0].id)

  const current = campaigns.find((c) => c.id === currentId) ?? campaigns[0] ?? null
  const currentPosts = current ? posts.filter((p) => p.campaignId === current.id) : []

  /** 게시물 추가 후 바로 다른 화면으로 이동할 때 사용: 화면이 닫히기 전에 저장까지 끝낸다 */
  const addPostNow = (post: Post) => {
    const next = [post, ...posts]
    try {
      localStorage.setItem('adcheckbiz.posts', JSON.stringify(next))
    } catch {
      /* 저장 실패는 무시 (시크릿 모드 등) */
    }
    setPosts(next)
  }

  return { campaigns, setCampaigns, posts, setPosts, addPostNow, current, currentPosts, setCurrentId }
}
