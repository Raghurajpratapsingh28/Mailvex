import { Suspense } from "react"
import SigninView from "@/components/signin-view"

export default function SigninPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SigninView />
    </Suspense>
  )
}
