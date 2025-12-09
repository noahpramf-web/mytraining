export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  restTime: string; // Suggested rest time, e.g., "60s", "90s"
  tiktokSearchTerm: string; // Used for TikTok direct search link
}

export interface DayPlan {
  dayName: string; // e.g., "Segunda-feira"
  focus: string; // e.g., "Peito e Tríceps"
  description: string; // Brief motivation or summary
  exercises: Exercise[];
}

export interface WeeklyPlan {
  days: DayPlan[];
}