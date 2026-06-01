'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

interface LogPageLayoutProps {
  title: string
  subtitle: string
  icon: string
  iconColor: string
  backHref?: string
  children: ReactNode
  sidebar?: ReactNode
  insightTitle?: string
  insightDescription?: string
}

export function LogPageLayout({
  title,
  subtitle,
  icon,
  iconColor,
  backHref = '/dashboard/log',
  children,
  sidebar,
}: LogPageLayoutProps) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1280px] mx-auto">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted hover:text-primary transition-colors mb-4"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          arrow_back
        </span>
        Back to journal
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`material-symbols-outlined text-[24px] ${iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
            {title}
          </h1>
        </div>
        <p className="text-[15px] text-[oklch(48%_0.010_260)]">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">{children}</div>
        {sidebar && <div className="lg:col-span-4 space-y-5">{sidebar}</div>}
      </div>
    </div>
  )
}