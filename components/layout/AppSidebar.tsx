'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { NAV_ITEMS, SETTINGS_NAV_ITEM, MOBILE_TABS, type NavItem } from '@/lib/config/nav.config'

interface AppSidebarProps {
  user: { name: string; email: string }
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  return pathname.startsWith(href)
}

function isLogSectionActive(pathname: string): boolean {
  return pathname.startsWith('/dashboard/log')
}

function LeafLink({
  item,
  pathname,
  expanded,
}: {
  item: NavItem
  pathname: string
  expanded: boolean
}) {
  const active = isActive(pathname, item.href!)
  return (
    <Link
      href={item.href!}
      title={expanded ? undefined : item.label}
      className={cn(
        'flex items-center gap-3 rounded-lg text-[14px] font-medium transition-colors',
        expanded ? 'px-3 py-2' : 'justify-center px-0 py-2',
        active ? 'bg-surface-low text-primary' : 'text-fg-muted hover:bg-surface-low hover:text-fg',
      )}
    >
      <span
        className="material-symbols-outlined text-[20px] leading-none flex-shrink-0"
        style={{
          fontVariationSettings: active
            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
            : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
        }}
      >
        {item.icon}
      </span>
      <span
        className={cn(
          'whitespace-nowrap transition-opacity duration-150',
          expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

function LogAccordion({
  item,
  pathname,
  expanded,
}: {
  item: NavItem
  pathname: string
  expanded: boolean
}) {
  const sectionActive = isLogSectionActive(pathname)
  const [open, setOpen] = useState(sectionActive)

  useEffect(() => {
    if (sectionActive) setOpen(true)
  }, [sectionActive])

  if (!expanded) {
    return (
      <Link
        href="/dashboard/log"
        title="Log"
        className={cn(
          'flex items-center justify-center py-2 rounded-lg transition-colors',
          sectionActive
            ? 'bg-surface-low text-primary'
            : 'text-fg-muted hover:bg-surface-low hover:text-fg',
        )}
      >
        <span
          className="material-symbols-outlined text-[20px] leading-none"
          style={{
            fontVariationSettings: sectionActive
              ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
              : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
          }}
        >
          {item.icon}
        </span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors',
          sectionActive ? 'text-primary' : 'text-fg-muted hover:bg-surface-low hover:text-fg',
        )}
      >
        <span
          className="material-symbols-outlined text-[20px] leading-none flex-shrink-0"
          style={{
            fontVariationSettings: sectionActive
              ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
              : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
          }}
        >
          {item.icon}
        </span>
        <span className="flex-1 text-left">{item.label}</span>
        <span
          className="material-symbols-outlined text-[18px] opacity-50 transition-transform duration-200"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
          {item.children!.map((child) => (
            <LeafLink key={child.href} item={child} pathname={pathname} expanded={true} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <>
      {/* Desktop sidebar — hover to expand */}
      <aside
        suppressHydrationWarning
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 bg-transparent h-full overflow-hidden',
          'transition-[width] duration-200 ease-out',
          expanded ? 'w-60' : 'w-16',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-2.5 flex-shrink-0',
            expanded ? 'px-4 py-5' : 'justify-center px-0 py-5',
          )}
        >
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-on-primary text-[13px] font-bold tracking-tight">N</span>
          </div>
          <span
            className={cn(
              'text-[15px] font-semibold tracking-[-0.02em] text-fg whitespace-nowrap transition-opacity duration-150',
              expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
            )}
          >
            Nuvora
          </span>
        </div>

        {/* Nav — vertically centered */}
        <nav className="flex-1 flex flex-col justify-center overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <LogAccordion key={item.label} item={item} pathname={pathname} expanded={expanded} />
            ) : (
              <LeafLink key={item.href} item={item} pathname={pathname} expanded={expanded} />
            ),
          )}
        </nav>

        {/* Bottom: settings + sign out */}
        <div className="px-2 pb-3 pt-3 space-y-0.5">
          <LeafLink item={SETTINGS_NAV_ITEM} pathname={pathname} expanded={expanded} />

          <button
            onClick={handleSignOut}
            title={expanded ? undefined : `${user.name} — Sign out`}
            className={cn(
              'w-full rounded-lg hover:bg-surface-low transition-colors',
              expanded ? 'flex items-center gap-3 px-3 py-2.5' : 'flex justify-center px-0 py-2.5',
            )}
          >
            <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-[13px] font-semibold text-fg">
              {initial}
            </div>
            {expanded && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium text-fg truncate">{user.name}</p>
                  <p className="text-[11px] text-fg-subtle truncate">{user.email}</p>
                </div>
                <span
                  className="material-symbols-outlined text-[18px] text-fg-subtle"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  logout
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tabs — 4 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-transparent border-t border-border/50 h-16 safe-area-bottom">
        {MOBILE_TABS.map((tab) => {
          const active = tab.href ? isActive(pathname, tab.href) : false
          return (
            <Link
              key={tab.href}
              href={tab.href!}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                active ? 'text-primary' : 'text-fg-subtle',
              )}
            >
              <span
                className="material-symbols-outlined text-[22px] leading-none"
                style={{
                  fontVariationSettings: active
                    ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                    : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {tab.icon}
              </span>
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}