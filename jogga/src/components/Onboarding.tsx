import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Target, Calendar, User, Activity } from 'lucide-react';
import { ExperienceLevel, GoalType, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const STEPS = [
  { id: 'name', title: 'What is your name?', icon: User },
  { id: 'experience', title: 'What is your experience level?', icon: Activity },
  { id: 'goal', title: 'What is your goal?', icon: Target },
  { id: 'date', title: 'When is your target date?', icon: Calendar },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    experienceLevel: 'beginner',
    goalType: '5k',
    goalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    preferredDays: [1, 2, 3, 5, 6], // Mon, Tue, Wed, Fri, Sat
    weeklyMileagePreference: 15,
  });

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(formData as UserProfile);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-transparent border-b-2 border-zinc-800 p-4 text-3xl font-light focus:border-zinc-400 outline-none transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 gap-4">
            {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, experienceLevel: level })}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all",
                  formData.experienceLevel === level 
                    ? "border-zinc-100 bg-zinc-100 text-zinc-900" 
                    : "border-zinc-800 hover:border-zinc-600"
                )}
              >
                <div className="text-xl font-medium capitalize">{level}</div>
                <div className="text-sm opacity-60">
                  {level === 'beginner' && "Just starting out or returning after a long break."}
                  {level === 'intermediate' && "Running regularly and looking to improve."}
                  {level === 'advanced' && "Experienced runner with specific performance goals."}
                </div>
              </button>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-4">
            {(['5k', '10k', 'half-marathon', 'marathon', 'fitness'] as GoalType[]).map((goal) => (
              <button
                key={goal}
                onClick={() => setFormData({ ...formData, goalType: goal })}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all",
                  formData.goalType === goal 
                    ? "border-zinc-100 bg-zinc-100 text-zinc-900" 
                    : "border-zinc-800 hover:border-zinc-600"
                )}
              >
                <div className="text-lg font-medium capitalize">{goal.replace('-', ' ')}</div>
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <input
              type="date"
              className="w-full bg-transparent border-b-2 border-zinc-800 p-4 text-3xl font-light focus:border-zinc-400 outline-none transition-colors"
              value={formData.goalDate}
              onChange={(e) => setFormData({ ...formData, goalDate: e.target.value })}
            />
            <p className="text-sm text-zinc-500">Pick a race date or a target date for your goal.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const Icon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-8 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon size={16} />
              <span className="text-xs uppercase tracking-widest font-semibold">Step {step + 1} of {STEPS.length}</span>
            </div>
            <h1 className="text-4xl font-light tracking-tight">{STEPS[step].title}</h1>
          </div>

          {renderStep()}
        </motion.div>
      </div>

      <div className="py-8 flex items-center justify-between">
        <button
          onClick={back}
          className={cn(
            "p-4 rounded-full border border-zinc-800 transition-opacity",
            step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          disabled={step === 0 && !formData.name}
          className="bg-zinc-100 text-zinc-900 px-8 py-4 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {step === STEPS.length - 1 ? 'Generate Plan' : 'Continue'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
