'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { NAV_GROUPS, SETTINGS_NAV_ITEM, type NavItem } from '@/lib/config/nav.config'

const MOBILE_TABS: NavItem[] = [
  { label: 'Home', href: '/app', icon: 'home' },
  { label: 'Log', href: '/dashboard/log', icon: 'edit_note' },
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Insights', href: '/dashboard/insights', icon: 'auto_awesome' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

interface AppSidebarProps {
  user: { name: string; email: string }
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors',
        active
          ? 'bg-surface-low text-primary'
          : 'text-fg-muted hover:bg-surface-low hover:text-fg',
      )}
    >
      <span
        className="material-symbols-outlined text-[20px] leading-none"
        style={{
          fontVariationSettings: active
            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
            : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
        }}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  )
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const initial = user.name.charAt(0).toUpperCase()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-on-primary text-[13px] font-bold tracking-tight">N</span>
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">Nuvora Health</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: settings + user */}
      <div className="px-2 pb-3 border-t border-border pt-3 space-y-1">
        <NavLink item={SETTINGS_NAV_ITEM} pathname={pathname} />

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg hover:bg-surface-low transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-[13px] font-semibold text-fg">
            {initial}
          </div>
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
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-surface border-r border-border h-full">
        {sidebarContent}
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-surface border-t border-border h-16 safe-area-bottom">
        {MOBILE_TABS.map((tab) => {
          const active = isNavActive(pathname, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
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
              <span className={cn('text-[10px] font-medium', active ? 'font-semibold' : '')}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
