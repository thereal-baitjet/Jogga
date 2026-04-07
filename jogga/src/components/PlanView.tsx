import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Calendar, CheckCircle2, Circle, Clock, MapPin } from 'lucide-react';
import { Workout, WorkoutType } from '../types';
import { cn } from '../lib/utils';

interface PlanViewProps {
  workouts: Workout[];
  onBack: () => void;
  onSelectWorkout: (workout: Workout) => void;
}

const TYPE_COLORS: Record<WorkoutType, string> = {
  'Easy run': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Long run': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Tempo run': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Interval session': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Recovery run': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Race-pace run': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Hill workout': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Strength session': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  'Mobility/recovery session': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

export default function PlanView({ workouts, onBack, onSelectWorkout }: PlanViewProps) {
  // Group by week
  const weeks: Workout[][] = [];
  let currentWeek: Workout[] = [];
  
  workouts.forEach((w, i) => {
    currentWeek.push(w);
    if (currentWeek.length === 7 || i === workouts.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto w-full">
      {/* Header */}
      <header className="p-6 flex items-center gap-4 border-b border-zinc-900 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-medium">Training Plan</h1>
      </header>

      {/* Content */}
      <div className="p-6 space-y-10 pb-24">
        {weeks.map((week, weekIndex) => (
          <section key={weekIndex} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Week {weekIndex + 1}</h2>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {week.filter(w => w.status === 'completed').length}/7 Completed
              </span>
            </div>

            <div className="space-y-3">
              {week.map((workout) => (
                <motion.button
                  key={workout.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectWorkout(workout)}
                  className={cn(
                    "w-full rounded-2xl p-4 flex items-center gap-4 border transition-all",
                    workout.status === 'completed' 
                      ? "bg-zinc-900/30 border-zinc-900 opacity-60" 
                      : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                  )}
                >
                  <div className="shrink-0">
                    {workout.status === 'completed' ? (
                      <CheckCircle2 size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} className="text-zinc-700" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest", TYPE_COLORS[workout.type])}>
                        {workout.type}
                      </span>
                    </div>
                    <div className="font-medium">{workout.durationMinutes}m {workout.type}</div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-zinc-500">
                    {workout.distanceTarget && (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin size={12} />
                        <span>{workout.distanceTarget}km</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <Clock size={12} />
                      <span>{workout.durationMinutes}m</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
