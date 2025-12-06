export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  videoSearchTerm: string; // Used to generate a YouTube search link
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