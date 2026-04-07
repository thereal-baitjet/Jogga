import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, Pause, Square, Activity, Zap, Clock, MapPin } from 'lucide-react';
import { Workout } from '../types';
import { cn, calculateDistance } from '../lib/utils';
import { playAudioCue } from '../services/audioService';

interface LiveWorkoutProps {
  workout: Workout;
  onComplete: (data: { distance: number; duration: number; path: { lat: number; lng: number; timestamp: number }[] }) => void;
  onCancel: () => void;
}

export default function LiveWorkout({ workout, onComplete, onCancel }: LiveWorkoutProps) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [isFinished, setIsFinished] = useState(false);
  const [path, setPath] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'active' | 'error'>('searching');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Wake Lock management
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error(`${(err as Error).name}, ${(err as Error).message}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive) {
      requestWakeLock();
      // Start GPS tracking
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy: acc } = position.coords;
            setAccuracy(acc);
            
            // Filter out inaccurate points (e.g., > 30m)
            if (acc > 30) return;

            setGpsStatus('active');
            
            setPath(prev => {
              const lastPoint = prev[prev.length - 1];
              if (lastPoint) {
                const d = calculateDistance(lastPoint.lat, lastPoint.lng, latitude, longitude);
                // Only add if we've moved at least 5 meters to avoid jitter
                if (d < 0.005) return prev;
                setDistance(dTotal => dTotal + d);
              }
              return [...prev, { lat: latitude, lng: longitude, timestamp: Date.now() }];
            });
          },
          (error) => {
            console.error("GPS Error:", error);
            setGpsStatus('error');
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      releaseWakeLock();
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    return () => {
      releaseWakeLock();
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    if (distance > 0) {
      const minutes = seconds / 60;
      const paceVal = minutes / distance;
      const paceMin = Math.floor(paceVal);
      const paceSec = Math.floor((paceVal - paceMin) * 60);
      setPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
    }
  }, [seconds, distance]);

  // Audio Cues
  useEffect(() => {
    if (isActive && seconds === 1) {
      playAudioCue(`Starting your ${workout.type}. Let's go! Target pace is ${workout.paceTarget || 'easy effort'}.`);
    }
    
    // Halfway cue
    const targetSeconds = (workout.durationMinutes || 30) * 60;
    if (isActive && seconds === Math.floor(targetSeconds / 2)) {
      playAudioCue("You're halfway there! Keep pushing, you're doing great.");
    }

    if (isActive && seconds === targetSeconds) {
      setIsActive(false);
      setIsFinished(true);
      playAudioCue("Workout complete! Excellent work today. Time for your cool down.");
    }
  }, [isActive, seconds, workout]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    onComplete({
      distance,
      duration: Math.floor(seconds / 60),
      path
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto w-full p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={onCancel} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {workout.type}
          </div>
          <div className={cn(
            "text-[8px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 mt-1",
            gpsStatus === 'active' ? "text-green-500" : gpsStatus === 'searching' ? "text-yellow-500" : "text-red-500"
          )}>
            <div className={cn("w-1 h-1 rounded-full animate-pulse", gpsStatus === 'active' ? "bg-green-500" : gpsStatus === 'searching' ? "bg-yellow-500" : "bg-red-500")} />
            GPS {gpsStatus} {accuracy && gpsStatus === 'active' && `(${Math.round(accuracy)}m)`}
          </div>
        </div>
        <div className="w-10" /> 
      </div>

      {/* Main Stats */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-12">
        <div className="text-center space-y-2">
          <div className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Time</div>
          <div className="text-8xl font-light tracking-tighter tabular-nums">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="grid grid-cols-2 w-full gap-8">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <MapPin size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Distance</span>
            </div>
            <div className="text-4xl font-light tabular-nums">{distance.toFixed(2)}<span className="text-sm ml-1 opacity-50">km</span></div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Activity size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Pace</span>
            </div>
            <div className="text-4xl font-light tabular-nums">{pace}<span className="text-sm ml-1 opacity-50">/km</span></div>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <Zap size={18} className="text-yellow-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Target</div>
              <div className="text-sm font-medium">{workout.paceTarget || 'Easy Effort'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Effort</div>
            <div className="text-sm font-medium">{workout.effortTarget}/10</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="py-12 flex items-center justify-center gap-8">
        {!isFinished ? (
          <>
            <button 
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl",
                isActive ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-zinc-900"
              )}
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            {seconds > 0 && (
              <button 
                onClick={handleFinish}
                className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 active:scale-90 transition-all"
              >
                <Square size={24} fill="currentColor" />
              </button>
            )}
          </>
        ) : (
          <button 
            onClick={handleFinish}
            className="bg-zinc-100 text-zinc-900 px-12 py-5 rounded-full font-bold text-lg shadow-2xl active:scale-95 transition-all"
          >
            Finish Workout
          </button>
        )}
      </div>
    </div>
  );
}
