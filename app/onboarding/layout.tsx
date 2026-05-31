import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-md border-b border-border/40">
        <Link href="/" className="text-[13px] font-semibold tracking-[0.06em] uppercase text-primary">
          Nuvora Health
        </Link>
      </header>
      <main className="flex-1 pt-16">{children}</main>
    </div>
  )
}
