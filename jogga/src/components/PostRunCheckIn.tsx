import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Star, MessageSquare, ChevronRight, Activity, Zap, MapPin } from 'lucide-react';
import { Workout, WorkoutResult } from '../types';
import { cn } from '../lib/utils';

interface PostRunCheckInProps {
  workout: Workout;
  liveData: { distance: number; duration: number; path: { lat: number; lng: number; timestamp: number }[] } | null;
  onComplete: (result: WorkoutResult) => void;
}

export default function PostRunCheckIn({ workout, liveData, onComplete }: PostRunCheckInProps) {
  const [effort, setEffort] = useState(5);
  const [notes, setNotes] = useState('');
  const [actualDistance, setActualDistance] = useState(liveData?.distance || workout.distanceTarget || 0);
  const [actualDuration, setActualDuration] = useState(liveData?.duration || workout.durationMinutes);

  const handleSubmit = () => {
    onComplete({
      completedAt: new Date().toISOString(),
      actualDistance,
      actualDuration,
      avgPace: actualDistance > 0 ? `${(actualDuration / actualDistance).toFixed(2)} min/km` : '0:00',
      perceivedEffort: effort,
      notes,
      path: liveData?.path
    });
  };

  const renderMap = () => {
    if (!liveData?.path || liveData.path.length < 2) return null;

    // Simple SVG path mapping
    const lats = liveData.path.map(p => p.lat);
    const lngs = liveData.path.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const width = 300;
    const height = 150;
    const padding = 20;

    const scaleX = (lng: number) => padding + ((lng - minLng) / (maxLng - minLng || 1)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - (padding + ((lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding));

    const points = liveData.path.map(p => `${scaleX(p.lng)},${scaleY(p.lat)}`).join(' ');

    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin size={16} />
          <h2 className="text-xs font-semibold uppercase tracking-widest">Run Map</h2>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex justify-center overflow-hidden">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              points={points}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Start point */}
            <circle cx={scaleX(liveData.path[0].lng)} cy={scaleY(liveData.path[0].lat)} r="4" fill="#3b82f6" />
            {/* End point */}
            <circle cx={scaleX(liveData.path[liveData.path.length - 1].lng)} cy={scaleY(liveData.path[liveData.path.length - 1].lat)} r="4" fill="#ef4444" />
          </svg>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col max-w-md mx-auto w-full space-y-10 pb-24">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-light tracking-tight">Great run!</h1>
        <p className="text-zinc-500">How did it feel today?</p>
      </div>

      <div className="space-y-8 flex-1">
        {renderMap()}

        {/* Run Summary Card */}
        {liveData && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity size={16} />
              <h2 className="text-xs font-semibold uppercase tracking-widest">Run Summary</h2>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 grid grid-cols-2 gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={80} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Distance</div>
                <div className="text-3xl font-light tabular-nums">
                  {liveData.distance.toFixed(2)}
                  <span className="text-xs ml-1 opacity-50">km</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Duration</div>
                <div className="text-3xl font-light tabular-nums">
                  {liveData.duration}
                  <span className="text-xs ml-1 opacity-50">min</span>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Effort Slider */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Zap size={16} />
              <h2 className="text-xs font-semibold uppercase tracking-widest">Perceived Effort</h2>
            </div>
            <span className="text-2xl font-light">{effort}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={effort}
            onChange={(e) => setEffort(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            <span>Easy</span>
            <span>Moderate</span>
            <span>Max Effort</span>
          </div>
        </section>

        {/* Stats Inputs */}
        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity size={14} />
              <label className="text-[10px] font-semibold uppercase tracking-widest">Distance (km)</label>
            </div>
            <input 
              type="number" 
              value={actualDistance}
              onChange={(e) => setActualDistance(parseFloat(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-lg focus:border-zinc-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Star size={14} />
              <label className="text-[10px] font-semibold uppercase tracking-widest">Duration (min)</label>
            </div>
            <input 
              type="number" 
              value={actualDuration}
              onChange={(e) => setActualDuration(parseInt(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-lg focus:border-zinc-500 outline-none"
            />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <MessageSquare size={14} />
            <label className="text-[10px] font-semibold uppercase tracking-widest">Notes</label>
          </div>
          <textarea 
            placeholder="How were your legs? Any soreness?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-32 focus:border-zinc-500 outline-none resize-none"
          />
        </section>
      </div>

      <button 
        onClick={handleSubmit}
        className="w-full bg-zinc-100 text-zinc-900 py-5 rounded-full font-bold flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
      >
        Save & Update Plan
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
