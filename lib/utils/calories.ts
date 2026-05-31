export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
  athlete:   1.9,
} as const

export const GOAL_CALORIE_DELTAS = {
  weight_loss:          -500,
  maintenance:             0,
  muscle_gain:          +300,
  athletic_performance: +200,
} as const

export const GOAL_PROTEIN_MULTIPLIERS = {
  weight_loss:          1.6,
  maintenance:          1.8,
  muscle_gain:          2.2,
  athletic_performance: 2.4,
} as const

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS
export type PrimaryGoal   = keyof typeof GOAL_CALORIE_DELTAS

export interface CalorieInputs {
  weight_kg:      number
  height_cm:      number
  age:            number
  gender:         'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
  activity_level: ActivityLevel
  primary_goal:   PrimaryGoal
}

export interface CalorieResult {
  bmr:            number
  tdee:           number
  calorie_target: number
  protein_target: number
}

export function computeCalories(inputs: CalorieInputs): CalorieResult {
  const { weight_kg, height_cm, age, gender, activity_level, primary_goal } = inputs

  const bmr =
    gender === 'male'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

  const tdee           = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level])
  const calorie_target = Math.max(1200, tdee + GOAL_CALORIE_DELTAS[primary_goal])
  const protein_target = Math.round(weight_kg * GOAL_PROTEIN_MULTIPLIERS[primary_goal])

  return { bmr: Math.round(bmr), tdee, calorie_target, protein_target }
}
