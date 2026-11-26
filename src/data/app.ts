/** 앱 정보 (가이드·개인정보 처리방침 화면에서 함께 쓴다) */
export const APP_INFO = {
  name: '애드체크',
  version: '1.4.0',
  /** 공개 연락처 (스토어·처리방침에 공개되는 앱 전용 주소). 비우면 화면에 "준비 중"으로 표시 */
  contactEmail: 'ion.adcheck@gmail.com',
  /** 개인정보 처리방침 시행일 */
  privacyEffectiveDate: '2026-11-21',
  /** 점검 기준 원문: 국가법령정보센터 「추천ㆍ보증 등에 관한 표시ㆍ광고 심사지침」 */
  sourceUrl: 'https://www.law.go.kr/%ED%96%89%EC%A0%95%EA%B7%9C%EC%B9%99/%EC%B6%94%EC%B2%9C%E3%86%8D%EB%B3%B4%EC%A6%9D%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%ED%91%9C%EC%8B%9C%E3%86%8D%EA%B4%91%EA%B3%A0%EC%8B%AC%EC%82%AC%EC%A7%80%EC%B9%A8',
} as const

/** 이 앱이 localStorage에 쓰는 키의 접두어. 초기화할 때 이 키들만 지운다 */
export const STORAGE_PREFIX = 'adcheck.'
