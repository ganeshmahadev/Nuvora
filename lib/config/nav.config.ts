export interface NavItem {
  label: string
  href?: string
  icon: string
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/app', icon: 'home' },
  {
    label: 'Log',
    icon: 'edit_note',
    children: [
      { label: 'Journal', href: '/dashboard/log', icon: 'book_2' },
      { label: 'Meals', href: '/dashboard/log/meals', icon: 'restaurant' },
      { label: 'Water', href: '/dashboard/log/water', icon: 'water_drop' },
      { label: 'Sleep', href: '/dashboard/log/sleep', icon: 'bedtime' },
      { label: 'Activity', href: '/dashboard/log/activity', icon: 'directions_run' },
      { label: 'Weight', href: '/dashboard/log/weight', icon: 'monitor_weight' },
    ],
  },
  { label: 'Insights', href: '/dashboard/insights', icon: 'auto_awesome' },
]

export const SETTINGS_NAV_ITEM: NavItem = {
  label: 'Settings',
  href: '/dashboard/settings',
  icon: 'settings',
}

export const MOBILE_TABS: NavItem[] = [
  { label: 'Home', href: '/app', icon: 'home' },
  { label: 'Log', href: '/dashboard/log', icon: 'edit_note' },
  { label: 'Insights', href: '/dashboard/insights', icon: 'auto_awesome' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]
