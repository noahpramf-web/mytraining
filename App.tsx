import React, { useState, useEffect, useCallback } from 'react';
import { WeeklyPlan } from './types';
import { generateWorkoutPlan, getReplacementExercise } from './services/geminiService';
import DaySlide from './components/DaySlide';
import TimerModal from './components/TimerModal';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, RefreshCw, Timer } from 'lucide-react';

const App: React.FC = () => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize current index based on day of week
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // If weekend (Sunday 0 or Saturday 6), default to Monday (Index 0)
    if (day === 0 || day === 6) return 0;
    // Map Monday (1) to 0, Tuesday (2) to 1, etc.
    return day - 1;
  });

  const [showTimer, setShowTimer] = useState<boolean>(false);
  
  // Global Workout Timer State
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false); // Default: Paused until interaction
  
  // Track loading state for individual exercises being swapped: key = "dayIndex-exerciseIndex"
  const [swappingState, setSwappingState] = useState<Record<string, boolean>>({});

  // Versão 11: Atualização para incluir campo restTime e autostop
  const CACHE_KEY = 'workout_plan_intermediate_v11_rest_autostop';

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setWorkoutSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatHeaderTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Show hours if needed, but usually MM:SS is enough for header unless > 60m
    if (totalSeconds >= 3600) {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
          setPlan(JSON.parse(cached));
          setLoading(false);
          return;
      }

      const data = await generateWorkoutPlan();
      setPlan(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err: any) {
      console.error("Failed to fetch plan:", err);
      // Show the actual error message if available (e.g. API key missing)
      setError(err?.message || "Não foi possível gerar o treino. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = async () => {
      localStorage.removeItem(CACHE_KEY);
      // Reset timer completely on new plan
      setWorkoutSeconds(0);
      setIsTimerRunning(false); 
      await fetchPlan();
      
      // When generating a NEW plan, we usually want to start from Monday to review it
      setCurrentIndex(0);
  };

  const handleSwapExercise = async (dayIndex: number, exerciseIndex: number) => {
    if (!plan) return;
    
    const swapKey = `${dayIndex}-${exerciseIndex}`;
    setSwappingState(prev => ({ ...prev, [swapKey]: true }));

    try {
        const day = plan.days[dayIndex];
        const currentExercise = day.exercises[exerciseIndex];
        
        const newExercise = await getReplacementExercise(currentExercise.name, day.focus);
        
        const newPlan = { ...plan };
        newPlan.days[dayIndex].exercises[exerciseIndex] = newExercise;
        
        setPlan(newPlan);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newPlan));
        
        // Clear completion status for the new exercise if any old key exists conflict
        const oldStorageId = `completed_${day.dayName.replace(/\s/g, '')}_${currentExercise.name.replace(/\s/g, '')}`;
        localStorage.removeItem(oldStorageId);

    } catch (err) {
        console.error("Failed to swap exercise", err);
        alert("Não foi possível substituir o exercício. Verifique a chave da API ou conexão.");
    } finally {
        setSwappingState(prev => {
            const newState = { ...prev };
            delete newState[swapKey];
            return newState;
        });
    }
  };

  // Called by DaySlide when all exercises for that day are marked complete
  const handleDayComplete = useCallback(() => {
    if (isTimerRunning) {
        setIsTimerRunning(false);
        // We could also show a celebration modal here in the future
    }
  }, [isTimerRunning]);

  // Called by DaySlide when any exercise is toggled
  const handleExerciseInteraction = useCallback(() => {
    // If timer is not running, start it (assuming workout started)
    if (!isTimerRunning) {
        setIsTimerRunning(true);
    }
  }, [isTimerRunning]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleNext = () => {
    if (plan && currentIndex < plan.days.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full"></div>
            <Loader2 size={48} className="text-red-600 animate-spin relative z-10" />
        </div>
        <h2 className="mt-8 text-3xl font-extrabold text-white tracking-tight uppercase">Construindo Ficha de Treino</h2>
        <p className="mt-2 text-neutral-500 max-w-md text-lg font-medium">
            Selecionando treinos do TikTok...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <Sparkles size={48} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2 uppercase">Ops! Algo deu errado.</h2>
        <p className="text-neutral-400 mb-6 text-lg max-w-lg mx-auto break-words">{error}</p>
        <button 
          onClick={fetchPlan}
          className="px-8 py-4 bg-red-600 text-white font-extrabold rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest text-base border-2 border-red-500"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden relative selection:bg-red-600/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
      
      {/* Top Bar */}
      <header className="flex justify-between items-start p-6 z-10 flex-shrink-0">
        <div className="flex items-center gap-2 mt-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-900/40 border-2 border-red-500 tracking-tighter">
                NP
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-white uppercase italic">CREATOR</h1>
        </div>
        
        {/* Actions Column */}
        <div className="flex flex-col gap-2 items-end">
            <button 
                onClick={regenerate}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all bg-neutral-900 px-4 py-2 rounded-lg border-2 border-neutral-800 w-full justify-center"
            >
                <RefreshCw size={14} />
                Novo Treino
            </button>
            
            <button 
                onClick={() => setShowTimer(true)}
                className={`
                    flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all bg-transparent px-4 py-2 rounded-lg border-2 w-full justify-center
                    ${isTimerRunning 
                        ? 'text-red-500 border-red-900/50 bg-red-900/10 animate-pulse' 
                        : 'text-neutral-400 border-neutral-800'
                    }
                `}
            >
                <Timer size={14} />
                {formatHeaderTime(workoutSeconds)}
            </button>
        </div>
      </header>

      {/* Main Content Area - Slide */}
      {/* mb-[76px] ensures the content ends exactly above the fixed bottom nav (approx 72px height + border) */}
      <main className="flex-1 flex flex-col relative max-w-6xl mx-auto w-full px-4 md:px-8 mb-[76px] overflow-hidden">
        {plan && (
          <div className="flex-1 relative w-full h-full">
             {plan.days.map((day, index) => (
               <div 
                key={index} 
                className={`absolute inset-0 transition-all duration-500 ease-in-out transform w-full h-full ${
                    index === currentIndex 
                    ? 'opacity-100 translate-x-0 z-10' 
                    : index < currentIndex 
                        ? 'opacity-0 -translate-x-10 pointer-events-none z-0' 
                        : 'opacity-0 translate-x-10 pointer-events-none z-0'
                }`}
               >
                 <DaySlide 
                    day={day} 
                    dayIndex={index}
                    isActive={index === currentIndex} 
                    swappingState={swappingState}
                    onSwapExercise={handleSwapExercise}
                    onDayComplete={handleDayComplete}
                    onExerciseInteraction={handleExerciseInteraction}
                 />
               </div>
             ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-neutral-950/95 backdrop-blur-xl border-t-2 border-neutral-900 p-4 z-50 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            
            {/* Day Rectangles (Tabs) */}
            <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide mask-fade-right">
                {plan?.days.map((day, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`
                            px-3 py-2 md:px-5 rounded-lg border-2 text-xs md:text-sm font-black transition-all uppercase tracking-wider whitespace-nowrap
                            ${
                                idx === currentIndex 
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105 z-10' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                            }
                        `}
                    >
                        {day.dayName.substring(0, 3)}
                    </button>
                ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3 flex-shrink-0">
                <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-xl bg-neutral-900 border-2 border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-neutral-800 disabled:opacity-50 disabled:hover:border-neutral-800 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    disabled={!plan || currentIndex === plan.days.length - 1}
                    className="p-3 rounded-xl bg-red-600 text-white border-2 border-red-500 hover:bg-red-500 hover:scale-105 disabled:opacity-50 disabled:hover:bg-red-600 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>

      {/* Timer Modal */}
      {showTimer && (
        <TimerModal 
            seconds={workoutSeconds}
            isRunning={isTimerRunning}
            onToggle={() => setIsTimerRunning(prev => !prev)}
            onReset={() => {
                setIsTimerRunning(false);
                setWorkoutSeconds(0);
            }}
            onClose={() => setShowTimer(false)} 
        />
      )}
    </div>
  );
};

export default App;