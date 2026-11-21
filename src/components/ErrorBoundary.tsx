import { Component, type ReactNode } from 'react'

/** 화면 하나에서 오류가 나도 앱 전체가 하얗게 멈추지 않게 막는다 (시연 사고 방지) */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-bold">잠시 문제가 생겼어요</p>
        <p className="text-sm text-slate-500">다시 시도하면 대부분 해결됩니다.</p>
        <button
          className="min-h-12 rounded-full bg-brand-600 px-6 py-3 text-base font-medium text-white active:opacity-50"
          onClick={() => location.assign('/')}
        >
          처음 화면으로
        </button>
        {import.meta.env.DEV && <pre className="mt-4 max-w-full overflow-auto text-left text-xs text-red-500">{this.state.error.message}</pre>}
      </div>
    )
  }
}
