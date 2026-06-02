'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const demoCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-4')
            entry.target.classList.add('opacity-100', 'translate-y-0')
          }
        })
      },
      { threshold: 0.1 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleCardMouseMove = (e: React.MouseEvent) => {
    const card = demoCardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rX = (y - cy) / 20
    const rY = (cx - x) / 20
    card.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.02)`
  }

  const handleCardMouseLeave = () => {
    if (demoCardRef.current) {
      demoCardRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        [data-reveal] { transition: opacity 0.7s ease, transform 0.7s ease; }
      `}</style>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-5 md:px-[120px] h-16 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-fg">Nuvora</span>
        </div>
        <nav className="hidden md:flex gap-10 items-center">
          <a className="text-sm font-medium text-primary hover:opacity-80 transition-opacity" href="#overview">Overview</a>
          <a className="text-sm font-medium text-fg-muted hover:text-primary transition-colors" href="#insights">Insights</a>
          <a className="text-sm font-medium text-fg-muted hover:text-primary transition-colors" href="#science">Science</a>
          <Link
            href="/auth/sign-up"
            className="bg-primary text-white text-sm font-medium px-6 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Start Your Journey
          </Link>
        </nav>
        <Link href="/auth/sign-up" className="md:hidden text-sm font-medium text-primary">
          Sign up
        </Link>
      </header>

      <main className="pt-16 overflow-hidden">
        {/* ── Hero ── */}
        <section id="overview" className="relative min-h-[90vh] flex items-center justify-center px-5 md:px-[120px]">
          <div className="max-w-4xl text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full mb-2">
              <span className="material-symbols-outlined text-primary text-lg">verified</span>
              <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest">Scandinavian Engineering</span>
            </div>

            <h1
              data-reveal
              className="opacity-0 translate-y-4 text-[40px] leading-[48px] md:text-[64px] md:leading-[72px] font-semibold text-fg max-w-3xl mx-auto tracking-tight"
            >
              Know your health{' '}
              <br />
              <span className="text-primary italic font-serif">at a glance.</span>
            </h1>

            <p
              data-reveal
              className="opacity-0 translate-y-4 text-lg leading-7 text-fg-muted max-w-xl mx-auto"
            >
              Quiet intelligence for those who value precision. Nuvora translates complex
              biological data into visual calm.
            </p>

            <div
              data-reveal
              className="opacity-0 translate-y-4 flex flex-col md:flex-row items-center justify-center gap-6 pt-6"
            >
              <Link
                href="/auth/sign-up"
                className="w-full md:w-auto bg-primary text-white px-16 py-6 rounded-full text-sm font-medium hover:scale-105 transition-transform"
              >
                Start Your Journey
              </Link>
              <Link
                href="/auth/sign-in"
                className="w-full md:w-auto border border-primary text-primary px-16 py-6 rounded-full text-sm font-medium hover:bg-surface-low transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Background blobs */}
          <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-ai/5 rounded-full blur-[100px]" />
          </div>
        </section>

        {/* ── Feature Bento Grid ── */}
        <section id="insights" className="py-16 px-5 md:px-[120px] bg-surface">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* AI Insights — wide card */}
              <div
                data-reveal
                className="opacity-0 translate-y-4 md:col-span-8 group bg-white border border-border rounded-xl p-10 flex flex-col justify-between overflow-hidden relative"
              >
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">auto_awesome</span>
                  <h3 className="text-2xl font-medium text-fg mb-1.5">AI-Powered Insights</h3>
                  <p className="text-base text-fg-muted max-w-md">
                    Our Quiet Intelligence engine identifies patterns in your health metrics before
                    you even notice them, providing proactive wellness guidance.
                  </p>
                </div>
                <div className="mt-16 flex justify-end">
                  <div
                    className="bg-surface-container p-6 rounded-xl border border-border group-hover:-translate-y-2.5 transition-transform duration-500"
                    style={{ boxShadow: '0 20px 40px -10px rgba(64, 92, 255, 0.1)' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-ai" />
                      <span className="text-[11px] font-semibold text-ai uppercase tracking-wider">Recommended Action</span>
                    </div>
                    <p className="text-base text-fg">
                      &quot;Optimal recovery window detected between 9:00 PM and 10:30 PM tonight.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Calm — full-width card */}
              <div
                data-reveal
                className="opacity-0 translate-y-4 md:col-span-12 bg-white border border-border rounded-xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-16"
              >
                <div className="md:w-1/2 space-y-3" id="science">
                  <span className="material-symbols-outlined text-primary text-[32px] block">filter_vintage</span>
                  <h3 className="text-2xl font-medium text-fg">Visual Calm</h3>
                  <p className="text-base text-fg-muted">
                    We believe health tracking shouldn&apos;t be stressful. Our UI recedes to highlight
                    what matters, using generous whitespace and a rhythmic, predictable interface.
                  </p>
                </div>
                <div className="md:w-1/2 w-full aspect-video bg-surface-low rounded-lg overflow-hidden flex items-center justify-center border border-border/30">
                  <div className="w-full h-full bg-gradient-to-br from-surface-container via-surface-low to-surface-container flex flex-col items-center justify-center gap-4 opacity-60">
                    <span className="material-symbols-outlined text-5xl text-border">landscape</span>
                    <span className="text-sm text-fg-subtle tracking-widest uppercase">Calm by design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Health Gist Demo ── */}
        <section className="py-16 px-5 md:px-[120px] bg-bg overflow-hidden">
          <div className="max-w-screen-xl mx-auto text-center mb-16">
            <h2 data-reveal className="opacity-0 translate-y-4 text-[32px] font-semibold text-fg mb-3 tracking-tight">
              The Health Gist
            </h2>
            <p data-reveal className="opacity-0 translate-y-4 text-base text-fg-muted max-w-2xl mx-auto">
              Interactive preview of your morning summary. No digging through menus—just the essentials.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Demo card */}
            <div
              ref={demoCardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="bg-white rounded-xl p-10 relative z-20 cursor-pointer transition-transform duration-300"
              style={{
                border: '0.5px solid rgba(64, 92, 255, 0.2)',
                boxShadow: '0 20px 40px -10px rgba(64, 92, 255, 0.1)',
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ai/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-ai"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      colors_spark
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-fg">Daily Summary</p>
                    <p className="text-xs font-semibold text-fg-muted tracking-wide">AI-Generated · 2m ago</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-surface-high rounded-full">
                  <span className="text-xs font-semibold text-primary tracking-wide">High Recovery</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-end gap-6">
                  <span className="text-[48px] leading-[56px] font-light tracking-[-0.04em] text-primary">82%</span>
                  <div className="pb-2">
                    <span className="text-[11px] font-semibold text-fg-muted block uppercase tracking-wider">Readiness Score</span>
                    <div className="h-1 w-32 bg-border rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>

                <p
                  data-reveal
                  className="opacity-0 translate-y-4 text-base text-fg leading-relaxed text-left border-l-2 border-primary/20 pl-4 italic"
                >
                  &quot;You are exceptionally well-rested today. Your heart rate variability (HRV) is
                  15% above your baseline, suggesting a high-intensity session would be beneficial.&quot;
                </p>

                <div className="grid grid-cols-3 gap-6 pt-2 border-t border-border/30">
                  {[
                    { label: 'Sleep Quality', value: 'Optimal' },
                    { label: 'Resting HR', value: '54 BPM' },
                    { label: 'Metabolic Stage', value: 'Balanced' },
                  ].map(({ label, value }) => (
                    <div key={label} data-reveal className="opacity-0 translate-y-4">
                      <span className="text-[11px] font-semibold text-fg-muted block uppercase tracking-wider">{label}</span>
                      <span className="text-2xl font-medium text-fg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accents */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-ai/5 rounded-full blur-3xl animate-float" />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 px-5 md:px-[120px] text-center border-t border-border/20">
          <div className="max-w-2xl mx-auto py-16">
            <h2 data-reveal className="opacity-0 translate-y-4 text-[40px] font-semibold text-fg mb-6 tracking-tight">
              Ready to experience quiet intelligence?
            </h2>
            <p data-reveal className="opacity-0 translate-y-4 text-lg text-fg-muted mb-10">
              Join 20,000+ individuals who have refined their health with Nuvora&apos;s
              Scandinavian precision.
            </p>
            <div data-reveal className="opacity-0 translate-y-4 flex flex-col md:flex-row gap-6 justify-center">
              <Link
                href="/auth/sign-up"
                className="bg-primary text-white px-16 py-6 rounded-full text-sm font-medium hover:scale-105 transition-transform"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-6 px-5 md:px-[120px] flex flex-col md:flex-row justify-between items-center bg-surface border-t border-border">
        <div className="flex items-center gap-1.5 mb-4 md:mb-0">
          <span className="text-sm font-bold text-primary uppercase tracking-tight">Nuvora Health</span>
          <span className="text-fg-muted mx-3 opacity-30">|</span>
          <span className="text-base text-fg-muted">© 2024. Scandinavian Precision.</span>
        </div>
        <div className="flex gap-10">
          {['Terms', 'Privacy', 'Support', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs font-semibold text-fg-muted hover:text-primary transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
