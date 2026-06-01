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
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const active = isActive(pathname, item.href!)
  return (
    <Link
      href={item.href!}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors',
        collapsed && 'justify-center',
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
      {!collapsed && item.label}
    </Link>
  )
}

function LogAccordion({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const sectionActive = isLogSectionActive(pathname)
  const [open, setOpen] = useState(sectionActive)

  useEffect(() => {
    if (sectionActive) setOpen(true)
  }, [sectionActive])

  if (collapsed) {
    return (
      <Link
        href="/dashboard/log"
        title="Log"
        className={cn(
          'flex items-center justify-center px-3 py-2 rounded-lg transition-colors',
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
            <LeafLink key={child.href} item={child} pathname={pathname} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((v) => {
      localStorage.setItem('sidebar-collapsed', String(!v))
      return !v
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const initial = user.name.charAt(0).toUpperCase()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 py-5 border-b border-border',
          collapsed && 'justify-center px-2',
        )}
      >
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-on-primary text-[13px] font-bold tracking-tight">N</span>
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">Nuvora</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <LogAccordion key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
          ) : (
            <LeafLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ),
        )}
      </nav>

      {/* Bottom: settings, collapse toggle, user */}
      <div className="px-2 pb-3 border-t border-border pt-3 space-y-0.5">
        <LeafLink item={SETTINGS_NAV_ITEM} pathname={pathname} collapsed={collapsed} />

        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-fg-subtle hover:bg-surface-low hover:text-fg transition-colors text-[14px] font-medium',
            collapsed && 'justify-center',
          )}
        >
          <span
            className="material-symbols-outlined text-[20px] leading-none flex-shrink-0 transition-transform duration-200"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            left_panel_close
          </span>
          {!collapsed && 'Collapse'}
        </button>

        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-low transition-colors',
            collapsed && 'justify-center',
          )}
          title={collapsed ? `${user.name} — Sign out` : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-[13px] font-semibold text-fg">
            {initial}
          </div>
          {!collapsed && (
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
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 bg-surface border-r border-border h-full transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile bottom tabs — 4 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-surface border-t border-border h-16 safe-area-bottom">
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
