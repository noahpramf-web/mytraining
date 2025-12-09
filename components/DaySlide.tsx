import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Target } from 'lucide-react';
import { DayPlan } from '../types';
import ExerciseCard from './ExerciseCard';

interface DaySlideProps {
  day: DayPlan;
  dayIndex: number;
  isActive: boolean;
  swappingState: Record<string, boolean>;
  onSwapExercise: (dayIndex: number, exerciseIndex: number) => void;
  onDayComplete: () => void;
  onExerciseInteraction: () => void;
}

const DaySlide: React.FC<DaySlideProps> = ({ day, dayIndex, isActive, swappingState, onSwapExercise, onDayComplete, onExerciseInteraction }) => {
  const [completedCount, setCompletedCount] = useState(0);

  // Calculate completed exercises from localStorage
  const calculateCompleted = useCallback(() => {
    const count = day.exercises.filter(ex => {
        const storageId = `completed_${day.dayName.replace(/\s/g, '')}_${ex.name.replace(/\s/g, '')}`;
        return localStorage.getItem(storageId) === 'true';
    }).length;
    setCompletedCount(count);

    // If active and fully completed, notify parent
    if (isActive && count === day.exercises.length && day.exercises.length > 0) {
        onDayComplete();
    }
  }, [day, isActive, onDayComplete]);

  // Initial calculation and update when day changes or becomes active
  useEffect(() => {
    calculateCompleted();
  }, [calculateCompleted]);

  if (!isActive) return null;

  const totalExercises = day.exercises.length;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* 1. Fixed Header Section: Day Name Badge Only */}
      <div className="flex-shrink-0 pt-2 pb-4 z-20">
        <div className="flex items-center gap-2 text-red-500 font-black tracking-widest uppercase text-sm md:text-base bg-neutral-900/80 w-fit px-3 py-1 rounded border border-red-900/30 backdrop-blur-sm shadow-lg">
          <Calendar size={16} strokeWidth={3} />
          <span>{day.dayName}</span>
        </div>
      </div>

      {/* 2. Scrollable Container: Everything else (Title, Exercises) */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide flex flex-col">
        
        {/* Main Muscles Title (Scrolls with content) */}
        <div className="mb-6 flex-shrink-0">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                {day.focus}
            </span>
            </h2>
            <div className="w-24 h-2 bg-red-600 mt-2 rounded-full"></div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8 flex-1">
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
                        onToggle={() => {
                            setTimeout(calculateCompleted, 0);
                            onExerciseInteraction();
                        }}
                    />
                );
            })}
        </div>
      </div>

      {/* 3. Fixed Footer: Counter Only (No Progress Bar) */}
      <div className="flex-shrink-0 bg-neutral-900 border-t-2 border-neutral-800 rounded-t-2xl px-6 py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Target size={20} className={completedCount === totalExercises ? "text-green-500" : "text-red-600"} />
                <span className="text-neutral-400 font-bold uppercase text-xs tracking-widest">
                    {completedCount === totalExercises ? "Treino Completo" : "Progresso Diário"}
                </span>
            </div>
            <div className="text-white font-black text-xl leading-none">
                {completedCount} <span className="text-neutral-600 text-sm">/ {totalExercises}</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default DaySlide;