export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Home', href: '/app', icon: 'home' },
      { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Log',
    items: [
      { label: 'Journal', href: '/dashboard/log', icon: 'edit_note' },
      { label: 'Meals', href: '/dashboard/log/meals', icon: 'restaurant' },
      { label: 'Water', href: '/dashboard/log/water', icon: 'water_drop' },
      { label: 'Sleep', href: '/dashboard/log/sleep', icon: 'bedtime' },
      { label: 'Activity', href: '/dashboard/log/activity', icon: 'directions_run' },
      { label: 'Weight', href: '/dashboard/log/weight', icon: 'monitor_weight' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { label: 'History', href: '/dashboard/history', icon: 'history' },
      { label: 'Insights', href: '/dashboard/insights', icon: 'auto_awesome' },
    ],
  },
]

export const SETTINGS_NAV_ITEM: NavItem = {
  label: 'Settings',
  href: '/dashboard/settings',
  icon: 'settings',
}