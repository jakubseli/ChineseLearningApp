const DAY_START_HOUR = 4;
const MAX_FREEZES = 2;
const FREEZE_EVERY = 7;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function studyDay(at: Date): string {
  return ymd(new Date(at.getFullYear(), at.getMonth(), at.getDate() - (at.getHours() < DAY_START_HOUR ? 1 : 0)));
}

export function studyDayEnd(at: Date): Date {
  const end = new Date(at.getFullYear(), at.getMonth(), at.getDate(), DAY_START_HOUR);
  if (at >= end) end.setDate(end.getDate() + 1);
  return end;
}

const nextDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return ymd(new Date(y, m - 1, d + 1));
};

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
