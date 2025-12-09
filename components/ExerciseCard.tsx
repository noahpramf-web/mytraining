import React, { useState, useEffect } from 'react';
import { Activity, Play, Check, Loader2, RefreshCw, Clock } from 'lucide-react';
import { Exercise } from '../types';
import { playSuccessSound, playSwapSound } from '../utils/sounds';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  dayName: string;
  isSwapping: boolean;
  onSwap: () => void;
  onToggle?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, dayName, isSwapping, onSwap, onToggle }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  
  // Create a somewhat unique ID for local storage
  const storageId = `completed_${dayName.replace(/\s/g, '')}_${exercise.name.replace(/\s/g, '')}`;

  useEffect(() => {
    // Check completion status
    const saved = localStorage.getItem(storageId);
    if (saved === 'true') {
      setIsCompleted(true);
    } else {
        setIsCompleted(false);
    }

    // Advanced platform detection for deep linking
    const checkPlatform = () => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/android/i.test(userAgent)) {
            return 'android';
        }
        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            return 'ios';
        }
        return 'desktop';
    };
    setPlatform(checkPlatform());

  }, [storageId, exercise.name]); // Re-check when exercise changes

  const toggleCompletion = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    
    // Play sound if marking as done
    if (newState) {
        playSuccessSound();
    }

    localStorage.setItem(storageId, String(newState));
    if (onToggle) {
        onToggle();
    }
  };

  const getTiktokLink = () => {
    const term = encodeURIComponent(exercise.tiktokSearchTerm);
    const webUrl = `https://www.tiktok.com/search?q=${term}`;

    if (platform === 'android') {
        // Android Intent: Tries to open app, falls back to webUrl if not installed
        // 'com.zhiliaoapp.musically' is the package name for TikTok
        return `intent://search?q=${term}#Intent;scheme=tiktok;package=com.zhiliaoapp.musically;S.browser_fallback_url=${webUrl};end`;
    }
    
    // iOS and Desktop use the standard link. 
    // iOS Universal Links mechanism handles the app opening if 'target' is not _blank.
    return webUrl;
  };

  const linkUrl = getTiktokLink();
  // Only use _blank for desktop. Mobile must use _self (undefined) to trigger app switch.
  const linkTarget = platform === 'desktop' ? "_blank" : undefined;

  return (
    <>
      <div 
        className={`
          relative border-2 rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 group
          ${isCompleted 
              ? 'bg-neutral-900/50 border-green-800 opacity-60' 
              : 'bg-neutral-900 border-neutral-800 hover:border-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.25)]'
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
                  playSwapSound();
                  onSwap();
              }}
              disabled={isSwapping}
              className={`
              flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg font-black text-xl border-2 transition-all relative overflow-hidden group/btn
              ${isCompleted 
                  ? 'bg-green-900/20 text-green-500 border-green-700' 
                  : 'bg-neutral-950 text-neutral-500 border-neutral-700 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 cursor-pointer'
              }
            `}>
              {isSwapping ? (
                  <Loader2 size={20} className="animate-spin text-neutral-500" />
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
            <Activity size={18} className={isCompleted ? "text-neutral-600" : "text-neutral-400"} />
            <span>{exercise.sets}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm ${isCompleted ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-black border-neutral-800 text-neutral-300'}`}>
            <span className={isCompleted ? "text-neutral-600" : "text-neutral-500"}>Reps</span>
            <span className={isCompleted ? "" : "text-white"}>{exercise.reps}</span>
          </div>

          {/* Rest Time Display */}
          {exercise.restTime && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm ${isCompleted ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-black border-neutral-800 text-neutral-300'}`}>
                <Clock size={18} className={isCompleted ? "text-neutral-600" : "text-red-600"} />
                <span className={isCompleted ? "" : "text-white"}>{exercise.restTime}</span>
            </div>
          )}
          
          {/* TikTok Direct Link Button */}
          <a 
            href={linkUrl}
            target={linkTarget}
            rel={platform === 'desktop' ? "noopener noreferrer" : undefined}
            className={`
              ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm transition-colors group/vid
              ${isCompleted 
                  ? 'border-neutral-800 text-neutral-600 pointer-events-none' 
                  : 'border-neutral-800 bg-neutral-900 text-white hover:border-red-600 hover:shadow-[0_0_10px_rgba(220,38,38,0.4)]'
              }
            `}
          >
            <Play size={16} className="fill-current group-hover/vid:text-[#ff0050] transition-colors" />
            <span className="hidden sm:inline">Ver Vídeo</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default ExerciseCard;