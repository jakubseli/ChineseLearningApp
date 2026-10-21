// Study days, the daily goal and the streak. A study day runs from 4:00 to 4:00 local time,
// so a session after midnight still counts for the evening before.
export const DAY_START_HOUR = 4;
export const DAILY_GOAL = 20; // answers
export const MAX_FREEZES = 2;
const FREEZE_EVERY = 7; // streak days

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function studyDay(at: Date): string {
  return ymd(new Date(at.getFullYear(), at.getMonth(), at.getDate() - (at.getHours() < DAY_START_HOUR ? 1 : 0)));
}

// When the study day that contains `at` ends.
export function studyDayEnd(at: Date): Date {
  const end = new Date(at.getFullYear(), at.getMonth(), at.getDate(), DAY_START_HOUR);
  if (at >= end) end.setDate(end.getDate() + 1);
  return end;
}

const nextDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return ymd(new Date(y, m - 1, d + 1));
};

// answers: answers per study day, from the review log. Replays the history from the first day: a day with the
// goal met extends the streak and every 7th streak day earns a freeze (max 2); a missed day uses up a freeze,
// or resets the streak if there is none. Today never breaks the streak, because it isn't over yet.
// shortcut: judges past days by today's goal; store the goal per day if changing it ever feels unfair.
export function streak(answers: Map<string, number>, goal: number, today: string): { days: number; freezes: number; goalMetToday: boolean } {
  let days = 0;
  let freezes = 0;
  for (let day = [...answers.keys()].sort()[0]; day && day <= today; day = nextDay(day)) {
    if ((answers.get(day) ?? 0) >= goal) {
      days++;
      if (days % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
    } else if (day === today) break;
    else if (freezes > 0) freezes--;
    else days = 0;
  }
  return { days, freezes, goalMetToday: (answers.get(today) ?? 0) >= goal };
}
