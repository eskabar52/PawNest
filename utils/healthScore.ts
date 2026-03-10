// utils/healthScore.ts — Sağlık Skoru Algoritması
import { HealthRecord, Symptom, Medication, CareTask } from '../types';

interface HealthScoreInput {
  records: HealthRecord[];
  symptoms: Symptom[];
  medications: Medication[];
  careTasks: CareTask[];
  petWeight: number;
  isNeutered: boolean;
}

interface HealthScoreResult {
  score: number;
  categories: {
    label: string;
    score: number;
    maxScore: number;
    color: string;
  }[];
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const categories = [];
  let totalScore = 0;
  let maxTotal = 0;

  // 1. Veteriner Ziyareti (max 25)
  const vetMax = 25;
  const recentCheckups = input.records.filter((r) => {
    const recordDate = new Date(r.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return r.type === 'checkup' && recordDate > sixMonthsAgo;
  });
  const vetScore = recentCheckups.length > 0 ? vetMax : Math.round(vetMax * 0.3);
  categories.push({ label: 'Veteriner', score: vetScore, maxScore: vetMax, color: '#1B4A6B' });
  totalScore += vetScore;
  maxTotal += vetMax;

  // 2. Aşı Durumu (max 25)
  const vaccineMax = 25;
  const vaccines = input.records.filter((r) => r.type === 'vaccine');
  const recentVaccines = vaccines.filter((v) => {
    const vDate = new Date(v.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return vDate > oneYearAgo;
  });
  const vaccineScore = vaccines.length === 0
    ? Math.round(vaccineMax * 0.4)
    : recentVaccines.length > 0
    ? vaccineMax
    : Math.round(vaccineMax * 0.6);
  categories.push({ label: 'Aşılar', score: vaccineScore, maxScore: vaccineMax, color: '#2D6A4F' });
  totalScore += vaccineScore;
  maxTotal += vaccineMax;

  // 3. Semptom Durumu (max 25)
  const symptomMax = 25;
  const recentSymptoms = input.symptoms.filter((s) => {
    const sDate = new Date(s.date);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return sDate > twoWeeksAgo;
  });
  const symptomPenalty = Math.min(recentSymptoms.length * 5, symptomMax);
  const symptomScore = symptomMax - symptomPenalty;
  categories.push({ label: 'Belirtiler', score: symptomScore, maxScore: symptomMax, color: '#8B2635' });
  totalScore += symptomScore;
  maxTotal += symptomMax;

  // 4. Bakım Rutini (max 25)
  const careMax = 25;
  const dailyTasks = input.careTasks.filter((t) => t.frequency === 'daily');
  const completedDaily = dailyTasks.filter((t) => t.isCompleted).length;
  const careRate = dailyTasks.length > 0 ? completedDaily / dailyTasks.length : 0.5;
  const careScore = Math.round(careMax * careRate);
  categories.push({ label: 'Bakım', score: careScore, maxScore: careMax, color: '#C9A84C' });
  totalScore += careScore;
  maxTotal += careMax;

  const finalScore = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 50;

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    categories,
  };
}
