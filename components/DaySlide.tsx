import React from 'react';
import { Calendar, Target } from 'lucide-react';
import { DayPlan } from '../types';
import ExerciseCard from './ExerciseCard';

interface DaySlideProps {
  day: DayPlan;
  dayIndex: number;
  isActive: boolean;
  swappingState: Record<string, boolean>;
  onSwapExercise: (dayIndex: number, exerciseIndex: number) => void;
}

const DaySlide: React.FC<DaySlideProps> = ({ day, dayIndex, isActive, swappingState, onSwapExercise }) => {
  if (!isActive) return null;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section - Minimalist & Bold */}
      <div className="flex flex-col gap-2 mb-6 pt-2">
        <div className="flex items-center gap-2 text-red-500 font-black tracking-widest uppercase text-sm md:text-base bg-neutral-900/80 w-fit px-3 py-1 rounded border border-red-900/30 backdrop-blur-sm">
          <Calendar size={16} strokeWidth={3} />
          <span>{day.dayName}</span>
        </div>
        
        {/* Main Muscles Title - Massive & Robust */}
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter drop-shadow-2xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
            {day.focus}
          </span>
        </h2>
        
        {/* Decorative Line */}
        <div className="w-24 h-2 bg-red-600 mt-2 rounded-full"></div>
      </div>

      {/* Exercises Grid */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-32">
            {day.exercises.map((exercise, idx) => {
                const isSwapping = swappingState[`${dayIndex}-${idx}`] || false;
                return (
                    <ExerciseCard 
                        key={`${exercise.name}-${idx}`} 
                        exercise={exercise} 
                        index={idx} 
                        dayName={day.dayName}
                        isSwapping={isSwapping}
                        onSwap={() => onSwapExercise(dayIndex, idx)}
                    />
                );
            })}
        </div>
      </div>
      
      {/* Summary Footer */}
      <div className="mt-2 pt-4 border-t-2 border-neutral-800 flex justify-between items-center text-sm text-neutral-500 font-bold uppercase tracking-wider bg-neutral-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <Target size={18} className="text-red-600" />
            <span>Total: {day.exercises.length} Exercícios</span>
        </div>
        <div className="text-neutral-600 hidden md:block">
            Arraste para o lado &rarr;
        </div>
      </div>
    </div>
  );
};

export default DaySlide;