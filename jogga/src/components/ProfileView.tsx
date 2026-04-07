import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, User, Save, Target, Calendar, Ruler, Weight, Activity } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

export default function ProfileView({ profile, onBack, onSave }: ProfileViewProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate a brief delay for UX
    setTimeout(() => {
      onSave(editedProfile);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto w-full relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Your Profile</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 text-zinc-100 hover:text-white transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-zinc-100 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={24} />
          )}
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 pb-32">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center relative group overflow-hidden">
            <User size={48} className="text-zinc-700" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-widest">Change</span>
            </div>
          </div>
          <div className="text-center">
            <input 
              type="text"
              value={editedProfile.name}
              onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              className="bg-transparent text-2xl font-light text-center focus:outline-none focus:border-b border-zinc-800 w-full"
            />
          </div>
        </div>

        {/* Basic Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Target size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">Training Goals</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">Goal Type</label>
              <select 
                value={editedProfile.goalType}
                onChange={(e) => setEditedProfile({ ...editedProfile, goalType: e.target.value as any })}
                className="w-full bg-transparent text-lg font-medium outline-none appearance-none"
              >
                <option value="5k">5k</option>
                <option value="10k">10k</option>
                <option value="half-marathon">Half Marathon</option>
                <option value="marathon">Marathon</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500">Goal Date</label>
              <input 
                type="date"
                value={editedProfile.goalDate}
                onChange={(e) => setEditedProfile({ ...editedProfile, goalDate: e.target.value })}
                className="w-full bg-transparent text-lg font-medium outline-none"
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">Preferences</h2>
          </div>
          <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500">Weekly Mileage Preference (km)</label>
            <input 
              type="number"
              value={editedProfile.weeklyMileagePreference}
              onChange={(e) => setEditedProfile({ ...editedProfile, weeklyMileagePreference: parseInt(e.target.value) })}
              className="w-full bg-transparent text-lg font-medium outline-none"
            />
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">Experience Level</h2>
          </div>
          <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
            <select 
              value={editedProfile.experienceLevel}
              onChange={(e) => setEditedProfile({ ...editedProfile, experienceLevel: e.target.value as any })}
              className="w-full bg-transparent text-lg font-medium outline-none appearance-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="p-8 text-center space-y-2">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Member since April 2026</p>
        <p className="text-[10px] text-zinc-700">Jogga Subscriber</p>
      </div>
    </div>
  );
}
