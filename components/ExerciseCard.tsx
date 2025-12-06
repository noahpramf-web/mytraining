import React, { useState, useEffect } from 'react';
import { Activity, PlayCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  dayName: string;
  isSwapping: boolean;
  onSwap: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, dayName, isSwapping, onSwap }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoSearchTerm)}`;
  
  // Create a somewhat unique ID for local storage
  const storageId = `completed_${dayName.replace(/\s/g, '')}_${exercise.name.replace(/\s/g, '')}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageId);
    if (saved === 'true') {
      setIsCompleted(true);
    } else {
        setIsCompleted(false);
    }
  }, [storageId, exercise.name]); // Re-check when exercise changes

  const toggleCompletion = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    localStorage.setItem(storageId, String(newState));
  };

  return (
    <div 
      className={`
        relative border-2 rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 group
        ${isCompleted 
            ? 'bg-neutral-900/50 border-green-800 opacity-60' 
            : 'bg-neutral-900 border-neutral-800 hover:border-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]'
        }
        ${isSwapping ? 'opacity-70 pointer-events-none border-dashed' : ''}
      `}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Swap Trigger (Number Box) */}
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onSwap();
            }}
            disabled={isSwapping}
            className={`
            flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg font-black text-xl border-2 transition-all relative overflow-hidden group/btn
            ${isCompleted 
                ? 'bg-green-900/20 text-green-500 border-green-700' 
                : 'bg-neutral-950 text-red-600 border-neutral-700 hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer'
            }
          `}>
            {isSwapping ? (
                <Loader2 size={20} className="animate-spin text-red-500" />
            ) : (
                <>
                    <span className="group-hover/btn:hidden">{index + 1}</span>
                    <RefreshCw size={18} className="hidden group-hover/btn:block animate-pulse" />
                </>
            )}
          </button>
          
          {/* Title */}
          <h3 className={`font-black text-xl md:text-2xl uppercase tracking-tight leading-tight transition-colors ${isCompleted ? 'text-neutral-500 line-through' : 'text-white'}`}>
            {isSwapping ? "Trocando..." : exercise.name}
          </h3>
        </div>

        {/* Checkbox Action */}
        <button 
            onClick={toggleCompletion}
            className={`
                flex-shrink-0 p-2 rounded-lg border-2 transition-all hover:scale-110
                ${isCompleted 
                    ? 'bg-green-600 border-green-500 text-white' 
                    : 'bg-neutral-950 border-neutral-700 text-neutral-600 hover:border-neutral-500'
                }
            `}
            title={isCompleted ? "Desmarcar" : "Marcar como feito"}
        >
            {isCompleted ? <Check size={24} strokeWidth={4} /> : <div className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Footer Info */}
      <div className="flex flex-wrap gap-3 ml-14">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm ${isCompleted ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-black border-neutral-800 text-neutral-300'}`}>
          <Activity size={18} className={isCompleted ? "text-neutral-600" : "text-red-600"} />
          <span>{exercise.sets}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm ${isCompleted ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-black border-neutral-800 text-neutral-300'}`}>
          <span className={isCompleted ? "text-neutral-600" : "text-neutral-500"}>Reps</span>
          <span className={isCompleted ? "" : "text-white"}>{exercise.reps}</span>
        </div>
        
        {/* Video Link */}
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`
            ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm transition-colors
            ${isCompleted 
                ? 'border-neutral-800 text-neutral-600 pointer-events-none' 
                : 'border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-500'
            }
          `}
        >
          <PlayCircle size={18} />
          <span className="hidden sm:inline">Vídeo</span>
        </a>
      </div>
    </div>
  );
};

export default ExerciseCard;