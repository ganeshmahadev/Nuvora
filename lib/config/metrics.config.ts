export type MetricType = 'water' | 'weight' | 'sleep' | 'activity'

export interface MetricConfig {
  type: MetricType
  label: string
  unit: string
  displayUnit: string
  icon: string
  color: string
  defaultTarget: number | null
  quickAddValues: number[] | null
  aggregation: 'sum' | 'latest'
  description: string
}

export const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  water: {
    type: 'water',
    label: 'Water',
    unit: 'ml',
    displayUnit: 'ml',
    icon: 'water_drop',
    color: 'bg-ai/10 text-ai',
    defaultTarget: 2500,
    quickAddValues: [250, 330, 500, 750],
    aggregation: 'sum',
    description: 'Daily water intake',
  },
  weight: {
    type: 'weight',
    label: 'Weight',
    unit: 'kg',
    displayUnit: 'kg',
    icon: 'monitor_weight',
    color: 'bg-warning-soft text-warning',
    defaultTarget: null,
    quickAddValues: null,
    aggregation: 'latest',
    description: 'Body weight',
  },
  sleep: {
    type: 'sleep',
    label: 'Sleep',
    unit: 'hours',
    displayUnit: 'hrs',
    icon: 'bedtime',
    color: 'bg-ai/10 text-ai',
    defaultTarget: 8,
    quickAddValues: null,
    aggregation: 'latest',
    description: 'Hours of sleep',
  },
  activity: {
    type: 'activity',
    label: 'Activity',
    unit: 'minutes',
    displayUnit: 'min',
    icon: 'directions_run',
    color: 'bg-primary/10 text-primary',
    defaultTarget: 30,
    quickAddValues: [15, 20, 30, 45, 60],
    aggregation: 'sum',
    description: 'Active minutes',
  },
}

export const ACTIVITY_TYPES = [
  'Running',
  'Walking',
  'Cycling',
  'Strength Training',
  'Yoga',
  'Swimming',
  'HIIT',
  'Dancing',
  'Hiking',
  'Other',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  Running: 'directions_run',
  Walking: 'directions_walk',
  Cycling: 'directions_bike',
  'Strength Training': 'fitness_center',
  Yoga: 'self_improvement',
  Swimming: 'pool',
  HIIT: 'bolt',
  Dancing: 'music_note',
  Hiking: 'hiking',
  Other: 'more_horiz',
}

export const INTENSITY_LABELS = ['low', 'moderate', 'high'] as const
export type IntensityLabel = (typeof INTENSITY_LABELS)[number]