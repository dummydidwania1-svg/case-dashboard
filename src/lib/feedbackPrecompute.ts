import { MOCK_CASES } from '@/data/mockData';
import { MOCK_FEEDBACK, FEEDBACK_TOP_THEME, FEEDBACK_COUNT, type CaseFeedback } from '@/data/mockFeedback';

type Param = 'structure' | 'analysis' | 'creativity' | 'delivery';

export interface FAMetrics {
  totalCases: number;
  dateRange: { start: string; end: string };
  globalAvg: { structure: number; analysis: number; creativity: number; delivery: number; score: number };
  weakestParam: Param;
  strongestParam: Param;
  mostImprovedParam: Param;
  flatParam: Param | null;
  weakestType: string;
  typeBreakdown: Record<string, { avgScore: number; count: number; weakestParam: string }>;
  hardAvgScore: number;
  mediumAvgScore: number;
  easyAvgScore: number;
  recentAvgScore: number;
  streakDays: number;
  allCasesCSV: string;
  feedbackEntries: CaseFeedback[];
  feedbackCount: number;
  dynamicQuestions: string[];
  initialGreeting: string;
}

const mean = (arr: number[]): number =>
  arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

function toDS(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function computeStreak(): number {
  const caseDates = new Set(MOCK_CASES.map(c => c.date));
  const today = new Date();
  let streak = 0;
  const d = new Date(today);
  while (caseDates.has(toDS(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeFAMetrics(): FAMetrics {
  const cases = [...MOCK_CASES].sort((a, b) => a.date.localeCompare(b.date));
  const n = cases.length;
  const params: Param[] = ['structure', 'analysis', 'creativity', 'delivery'];

  const globalAvg = {
    structure: mean(cases.map(c => c.structure)),
    analysis:  mean(cases.map(c => c.analysis)),
    creativity: mean(cases.map(c => c.creativity)),
    delivery:  mean(cases.map(c => c.delivery)),
    score:     mean(cases.map(c => c.score)),
  };

  const paramAvgs: Record<Param, number> = {
    structure: globalAvg.structure,
    analysis:  globalAvg.analysis,
    creativity: globalAvg.creativity,
    delivery:  globalAvg.delivery,
  };
  const weakestParam   = params.reduce((a, b) => paramAvgs[a] < paramAvgs[b] ? a : b);
  const strongestParam = params.reduce((a, b) => paramAvgs[a] > paramAvgs[b] ? a : b);

  const first10 = cases.slice(0, 10);
  const last10  = cases.slice(-10);
  const deltas: Record<Param, number> = {
    structure:  mean(last10.map(c => c.structure))  - mean(first10.map(c => c.structure)),
    analysis:   mean(last10.map(c => c.analysis))   - mean(first10.map(c => c.analysis)),
    creativity: mean(last10.map(c => c.creativity)) - mean(first10.map(c => c.creativity)),
    delivery:   mean(last10.map(c => c.delivery))   - mean(first10.map(c => c.delivery)),
  };
  const mostImprovedParam = params.reduce((a, b) => deltas[a] > deltas[b] ? a : b);

  const half = Math.floor(n / 2);
  const halfDeltas: Record<Param, number> = {
    structure:  Math.abs(mean(cases.slice(half).map(c => c.structure))  - mean(cases.slice(0, half).map(c => c.structure))),
    analysis:   Math.abs(mean(cases.slice(half).map(c => c.analysis))   - mean(cases.slice(0, half).map(c => c.analysis))),
    creativity: Math.abs(mean(cases.slice(half).map(c => c.creativity)) - mean(cases.slice(0, half).map(c => c.creativity))),
    delivery:   Math.abs(mean(cases.slice(half).map(c => c.delivery))   - mean(cases.slice(0, half).map(c => c.delivery))),
  };
  const flatParam = params.find(p => halfDeltas[p] < 0.3) ?? null;

  const types = [...new Set(cases.map(c => c.type))];
  const typeBreakdown: Record<string, { avgScore: number; count: number; weakestParam: string }> = {};
  types.forEach(t => {
    const tc = cases.filter(c => c.type === t);
    const tpa = {
      structure:  mean(tc.map(c => c.structure)),
      analysis:   mean(tc.map(c => c.analysis)),
      creativity: mean(tc.map(c => c.creativity)),
      delivery:   mean(tc.map(c => c.delivery)),
    };
    const wp = (Object.entries(tpa) as [string, number][]).reduce((a, b) => a[1] < b[1] ? a : b)[0];
    typeBreakdown[t] = { avgScore: mean(tc.map(c => c.score)), count: tc.length, weakestParam: wp };
  });
  const weakestType = types.reduce((a, b) => typeBreakdown[a].avgScore < typeBreakdown[b].avgScore ? a : b);

  const easyAvgScore   = mean(cases.filter(c => c.level === 'Easy').map(c => c.score));
  const mediumAvgScore = mean(cases.filter(c => c.level === 'Medium').map(c => c.score));
  const hardAvgScore   = mean(cases.filter(c => c.level === 'Hard').map(c => c.score));
  const recentAvgScore = mean(cases.slice(-14).map(c => c.score));
  const streakDays     = computeStreak();

  const allCasesCSV = cases
    .map(c => `${c.id},${c.date},${c.type},${c.level},${c.structure},${c.analysis},${c.creativity},${c.delivery},${c.score}`)
    .join('\n');

  const dynamicQuestions = generateDynamicQuestions(weakestType, streakDays, recentAvgScore, globalAvg.score);

  const initialGreeting =
    `Hi. I've analyzed interviewer feedback from ${FEEDBACK_COUNT} of your ${n} sessions. ` +
    `The most recurring theme is ${FEEDBACK_TOP_THEME}. ` +
    `${capitalize(mostImprovedParam)} shows the strongest improvement arc. ` +
    `Ask me what your interviewers are really saying.`;

  return {
    totalCases: n,
    dateRange: { start: cases[0].date, end: cases[n - 1].date },
    globalAvg,
    weakestParam,
    strongestParam,
    mostImprovedParam,
    flatParam,
    weakestType,
    typeBreakdown,
    hardAvgScore,
    mediumAvgScore,
    easyAvgScore,
    recentAvgScore,
    streakDays,
    allCasesCSV,
    feedbackEntries: MOCK_FEEDBACK,
    feedbackCount: FEEDBACK_COUNT,
    dynamicQuestions,
    initialGreeting,
  };
}

// Questions are feedback-specific — clearly distinct from AI Coach (which asks about scores)
function generateDynamicQuestions(
  weakestType: string,
  streakDays: number,
  recentAvgScore: number,
  overallAvgScore: number,
): string[] {
  const qs: string[] = [];

  // Q1: always about recurring feedback language
  qs.push('What patterns recur in my feedback?');

  // Q2: weakest type feedback deep-dive
  qs.push(`What do interviewers say about ${weakestType}?`);

  // Q3: temporal feedback arc
  if (streakDays >= 7 || recentAvgScore - overallAvgScore > 0.3) {
    qs.push('How has my feedback changed over time?');
  } else {
    qs.push('What has my feedback stopped flagging?');
  }

  return qs;
}

export const FA_METRICS: FAMetrics = computeFAMetrics();
