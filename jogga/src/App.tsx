import React, { useState, useEffect } from 'react';
import { UserProfile, Workout, ReadinessScore, WorkoutResult } from './types';
import { generatePlan } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import WorkoutDetail from './components/WorkoutDetail';
import PostRunCheckIn from './components/PostRunCheckIn';
import PlanView from './components/PlanView';
import LiveWorkout from './components/LiveWorkout';
import Subscription from './components/Subscription';
import ProfileView from './components/ProfileView';
import { AnimatePresence, motion } from 'motion/react';

type Screen = 'onboarding' | 'dashboard' | 'workout-detail' | 'live-workout' | 'post-run' | 'plan-view' | 'subscription' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [liveWorkoutData, setLiveWorkoutData] = useState<{ distance: number; duration: number; path: { lat: number; lng: number; timestamp: number }[] } | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore>({
    score: 82,
    consistency: 90,
    fatigue: 45,
    progress: 65,
    updatedAt: new Date().toISOString()
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('jogga_profile');
    const savedPlan = localStorage.getItem('jogga_plan');
    const unlocked = localStorage.getItem('jogga_unlocked') === 'true';
    
    // Check for Stripe success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      localStorage.setItem('jogga_unlocked', 'true');
      setIsUnlocked(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setIsUnlocked(unlocked);
    }

    if (savedProfile && savedPlan) {
      try {
        setProfile(JSON.parse(savedProfile));
        setPlan(JSON.parse(savedPlan));
        setScreen(unlocked || params.get('session_id') ? 'dashboard' : 'subscription');
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const newPlan = generatePlan(newProfile);
    setProfile(newProfile);
    setPlan(newPlan);
    localStorage.setItem('jogga_profile', JSON.stringify(newProfile));
    localStorage.setItem('jogga_plan', JSON.stringify(newPlan));
    
    if (isUnlocked) {
      setScreen('dashboard');
    } else {
      setScreen('subscription');
    }
  };

  const handleSelectWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setScreen('workout-detail');
  };

  const handleStartWorkout = () => {
    setScreen('live-workout');
  };

  const handleLiveWorkoutComplete = (data: { distance: number; duration: number; path: { lat: number; lng: number; timestamp: number }[] }) => {
    setLiveWorkoutData(data);
    setScreen('post-run');
  };

  const handlePostRunComplete = (result: WorkoutResult) => {
    if (!selectedWorkout) return;

    const updatedPlan = plan.map(w => 
      w.id === selectedWorkout.id 
        ? { 
            ...w, 
            status: 'completed' as const, 
            result,
            // Update top-level stats to reflect what was actually achieved
            distanceTarget: result.actualDistance,
            durationMinutes: result.actualDuration
          } 
        : w
    );

    setPlan(updatedPlan);
    localStorage.setItem('jogga_plan', JSON.stringify(updatedPlan));
    
    setReadiness(prev => ({
      ...prev,
      score: Math.min(100, prev.score + 2),
      consistency: Math.min(100, prev.consistency + 1),
      progress: Math.min(100, prev.progress + 1),
      updatedAt: new Date().toISOString()
    }));

    setScreen('dashboard');
    setSelectedWorkout(null);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('jogga_profile', JSON.stringify(updatedProfile));
    // Optionally regenerate plan if goal distance changed significantly, 
    // but for now we'll just keep the existing plan to avoid confusion.
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {screen === 'dashboard' && profile && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              profile={profile} 
              plan={plan} 
              readiness={readiness}
              onSelectWorkout={handleSelectWorkout}
              onViewPlan={() => setScreen('plan-view')}
              onViewProfile={() => setScreen('profile')}
            />
          </motion.div>
        )}

        {screen === 'workout-detail' && selectedWorkout && (
          <motion.div
            key="workout-detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <WorkoutDetail 
              workout={selectedWorkout} 
              onBack={() => setScreen('dashboard')}
              onStart={handleStartWorkout}
            />
          </motion.div>
        )}

        {screen === 'live-workout' && selectedWorkout && (
          <motion.div
            key="live-workout"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <LiveWorkout 
              workout={selectedWorkout} 
              onComplete={handleLiveWorkoutComplete}
              onCancel={() => setScreen('workout-detail')}
            />
          </motion.div>
        )}

        {screen === 'post-run' && selectedWorkout && (
          <motion.div
            key="post-run"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <PostRunCheckIn 
              workout={selectedWorkout} 
              liveData={liveWorkoutData}
              onComplete={handlePostRunComplete} 
            />
          </motion.div>
        )}

        {screen === 'plan-view' && (
          <motion.div
            key="plan-view"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <PlanView 
              workouts={plan} 
              onBack={() => setScreen('dashboard')}
              onSelectWorkout={handleSelectWorkout}
            />
          </motion.div>
        )}

        {screen === 'subscription' && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <Subscription onBack={() => setScreen(profile ? 'dashboard' : 'onboarding')} isUnlocked={isUnlocked} />
          </motion.div>
        )}

        {screen === 'profile' && profile && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <ProfileView 
              profile={profile} 
              onBack={() => setScreen('dashboard')} 
              onSave={handleProfileUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
