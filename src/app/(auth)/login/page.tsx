'use client'
export const dynamic = 'force-dynamic'
import { useAuth } from '@/hooks/useAuth'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg)]">
      {/* 背景グラデーション装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/10 dark:bg-indigo-800/5 rounded-full blur-3xl" />
      </div>

      {/* カード */}
      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-500/10 p-10 space-y-8">

          {/* ロゴ */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-2">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">TaskFlow</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">タスクと予定をシンプルに管理</p>
            </div>
          </div>

          {/* Googleログインボタン */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 h-12 px-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-hover)] hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.174 0 7.548 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Googleでログイン
          </button>

          <p className="text-center text-xs text-[var(--muted)]">
            ログインすることで利用規約に同意したことになります
          </p>
        </div>
      </div>
    </div>
  )
}
