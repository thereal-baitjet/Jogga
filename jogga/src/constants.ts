import { addDays, format, startOfWeek } from 'date-fns';
import { UserProfile, Workout, WorkoutType } from './types';

export const WORKOUT_DESCRIPTIONS: Record<WorkoutType, string> = {
  'Easy run': 'Build base aerobic fitness. You should be able to hold a conversation.',
  'Long run': 'Improve endurance and mental toughness for the distance.',
  'Tempo run': 'Sustained effort at a challenging but manageable pace.',
  'Interval session': 'Short bursts of speed followed by recovery to improve VO2 max.',
  'Recovery run': 'Very light effort to help blood flow and muscle recovery.',
  'Race-pace run': 'Practice running at your target race speed.',
  'Hill workout': 'Build leg strength and running economy by running uphill.',
  'Strength session': 'Focus on core, glutes, and single-leg stability.',
  'Mobility/recovery session': 'Stretching and foam rolling to prevent injury.'
};

export function generatePlan(profile: UserProfile): Workout[] {
  const workouts: Workout[] = [];
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
  const weeks = 12; // Default to 12-week plan for MVP

  // Distance multipliers based on goal
  const goalMultipliers: Record<string, number> = {
    '5k': 0.5,
    '10k': 1.0,
    'half-marathon': 2.0,
    'marathon': 4.0,
    'fitness': 0.8
  };
  const mult = goalMultipliers[profile.goalType] || 1.0;

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = addDays(startDate, w * 7 + d);
      const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)

      let type: WorkoutType | null = null;
      let duration = 0;
      let distance = 0;
      let pace = '';
      let effort = 0;
      let instructions = '';

      // Taper logic: reduce volume in the last 2 weeks
      const taperMult = w >= weeks - 2 ? 0.7 : 1.0;

      if (dayOfWeek === 1) { // Monday
        type = 'Strength session';
        duration = 30;
        effort = 6;
      } else if (dayOfWeek === 2) { // Tuesday
        type = w % 2 === 0 ? 'Interval session' : 'Tempo run';
        duration = 45;
        distance = (6 + (w * 0.5)) * mult * taperMult;
        pace = profile.experienceLevel === 'advanced' ? '4:15 min/km' : '5:00 min/km';
        effort = 8;
      } else if (dayOfWeek === 3) { // Wednesday
        type = 'Easy run';
        duration = 40;
        distance = (5 + (w * 0.2)) * mult * taperMult;
        pace = '6:00 min/km';
        effort = 4;
      } else if (dayOfWeek === 4) { // Thursday
        type = 'Rest' as any;
      } else if (dayOfWeek === 5) { // Friday
        type = 'Recovery run';
        duration = 30;
        distance = 4 * mult * taperMult;
        pace = '6:30 min/km';
        effort = 2;
      } else if (dayOfWeek === 6) { // Saturday
        type = 'Long run';
        duration = (60 + (w * 10)) * taperMult;
        distance = (10 + (w * 1.5)) * mult * taperMult;
        pace = '6:15 min/km';
        effort = 5;
      } else if (dayOfWeek === 0) { // Sunday
        type = 'Mobility/recovery session';
        duration = 20;
        effort = 2;
      }

      if (type && type !== ('Rest' as any)) {
        workouts.push({
          id: `w${w}d${d}-${Math.random().toString(36).substr(2, 9)}`,
          date: format(date, 'yyyy-MM-dd'),
          type,
          durationMinutes: Math.round(duration),
          distanceTarget: distance > 0 ? Number(distance.toFixed(1)) : undefined,
          paceTarget: pace || undefined,
          effortTarget: effort,
          instructions: WORKOUT_DESCRIPTIONS[type] || '',
          status: 'planned'
        });
      }
    }
  }

  return workouts;
}
