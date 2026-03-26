import { MOCK_CASES } from '@/data/mockData';

export interface CoachFilters {
  types: string[];
  levels: string[];
  time: string;
  customStart: string;
  customEnd: string;
}

export interface ParamAvg {
  structure: number;
  analysis: number;
  creativity: number;
  delivery: number;
  caseScore: number;
}

export interface StreakInfo {
  length: number;
  startDate: string;
  endDate: string;
}

export interface CoachMetrics {
  today: string;
  allCases: typeof MOCK_CASES;
  filteredCases: typeof MOCK_CASES;
  filteredCount: number;
  globalAvg: ParamAvg;
  filteredAvg: ParamAvg | null;
  currentStreak: StreakInfo;
  streakBreaks: string[];
  streakOverlapsFilter: boolean;
  outliers: typeof MOCK_CASES;
  activeFilters: CoachFilters;
}

const mean = (arr: number[]): number =>
  arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

function avgOf(cases: typeof MOCK_CASES): ParamAvg {
  return {
    structure: mean(cases.map(c => c.structure)),
    analysis: mean(cases.map(c => c.analysis)),
    creativity: mean(cases.map(c => c.creativity)),
    delivery: mean(cases.map(c => c.delivery)),
    caseScore: mean(cases.map(c => c.score)),
  };
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getFilterWindow(filters: CoachFilters, today: Date): { start: Date; end: Date } | null {
  if (filters.time === 'last7') {
    return { start: new Date(today.getTime() - 7 * 86400000), end: today };
  }
  if (filters.time === 'last30') {
    return { start: new Date(today.getTime() - 30 * 86400000), end: today };
  }
  if (filters.time === 'custom' && filters.customStart && filters.customEnd) {
    return {
      start: new Date(filters.customStart + 'T00:00:00'),
      end: new Date(filters.customEnd + 'T23:59:59'),
    };
  }
  return null;
}

function applyFilters(filters: CoachFilters, today: Date): typeof MOCK_CASES {
  const window = getFilterWindow(filters, today);
  return MOCK_CASES.filter(c => {
    if (filters.types.length > 0 && !filters.types.includes(c.type)) return false;
    if (filters.levels.length > 0 && !filters.levels.includes(c.level)) return false;
    if (window) {
      const d = new Date(c.date + 'T12:00:00');
      if (d < window.start || d > window.end) return false;
    }
    return true;
  });
}

function computeStreak(today: Date): StreakInfo {
  const caseDates = new Set(MOCK_CASES.map(c => c.date));
  let streak = 0;
  let startDate = '';
  const d = new Date(today);

  while (true) {
    const ds = toDateStr(d);
    if (caseDates.has(ds)) {
      streak++;
      startDate = ds;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    length: streak,
    startDate: streak > 0 ? startDate : '',
    endDate: streak > 0 ? toDateStr(today) : '',
  };
}

function computeBreaks(): string[] {
  const dates = [...new Set(MOCK_CASES.map(c => c.date))].sort();
  const breaks: string[] = [];

  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i] + 'T12:00:00');
    const next = new Date(dates[i + 1] + 'T12:00:00');
    const gap = Math.round((next.getTime() - curr.getTime()) / 86400000);
    for (let j = 1; j < gap; j++) {
      const b = new Date(curr);
      b.setDate(b.getDate() + j);
      breaks.push(toDateStr(b));
    }
  }
  return breaks;
}

function checkStreakOverlap(streak: StreakInfo, filters: CoachFilters, today: Date): boolean {
  if (streak.length === 0) return false;
  const window = getFilterWindow(filters, today);
  if (!window) return false;
  const sStart = new Date(streak.startDate + 'T12:00:00');
  const sEnd = new Date(streak.endDate + 'T12:00:00');
  return sStart <= window.end && sEnd >= window.start;
}

export function precompute(filters: CoachFilters): CoachMetrics {
  const today = new Date();
  const todayStr = toDateStr(today);

  const filtered = applyFilters(filters, today);
  const globalAvg = avgOf(MOCK_CASES);
  const filteredAvg = filtered.length > 0 ? avgOf(filtered) : null;
  const streak = computeStreak(today);
  const breaks = computeBreaks();
  const overlaps = checkStreakOverlap(streak, filters, today);

  const outliers =
    filtered.length > 0 && filteredAvg
      ? filtered.filter(
          c =>
            c.structure <= filteredAvg.structure - 1.0 &&
            c.analysis <= filteredAvg.analysis - 1.0 &&
            c.creativity <= filteredAvg.creativity - 1.0 &&
            c.delivery <= filteredAvg.delivery - 1.0
        )
      : [];

  return {
    today: todayStr,
    allCases: MOCK_CASES,
    filteredCases: filtered,
    filteredCount: filtered.length,
    globalAvg,
    filteredAvg,
    currentStreak: streak,
    streakBreaks: breaks,
    streakOverlapsFilter: overlaps,
    outliers,
    activeFilters: filters,
  };
}
