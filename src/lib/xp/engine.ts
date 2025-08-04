// XP Engine - Pure function for calculating XP with multipliers
export interface XPCalculationInput {
  base: number;
  difficulty: 'easy' | 'medium' | 'hard';
  classAligned?: boolean;
  firstTimeCombo?: boolean;
  socialProof?: boolean;
}

export interface XPCalculationResult {
  multiplier: number;
  total: number;
  breakdown: {
    base: number;
    difficulty: number;
    classAlignment?: number;
    novelty?: number;
    socialProof?: number;
  };
}

export function calculateXP(input: XPCalculationInput): XPCalculationResult {
  let multiplier = 1.0;
  const breakdown: XPCalculationResult['breakdown'] = {
    base: input.base,
    difficulty: 1.0,
  };

  // Apply difficulty multiplier
  switch (input.difficulty) {
    case 'medium':
      multiplier *= 1.2;
      breakdown.difficulty = 1.2;
      break;
    case 'hard':
      multiplier *= 1.5;
      breakdown.difficulty = 1.5;
      break;
    default:
      breakdown.difficulty = 1.0;
      break;
  }

  // Apply class alignment bonus (+20%)
  if (input.classAligned) {
    multiplier *= 1.2;
    breakdown.classAlignment = 1.2;
  }

  // Apply novelty bonus (+10%)
  if (input.firstTimeCombo) {
    multiplier *= 1.1;
    breakdown.novelty = 1.1;
  }

  // Apply social proof bonus (+10%)
  if (input.socialProof) {
    multiplier *= 1.1;
    breakdown.socialProof = 1.1;
  }

  const total = Math.ceil(input.base * multiplier);

  return {
    multiplier,
    total,
    breakdown,
  };
}

// Default base XP values from rules
export const DEFAULT_BASE_XP = {
  read_doc: 5,
  implement_utility: 15,
  complete_tutorial: 20,
  ship_mvp_local: 35,
  deploy_mvp: 50,
  write_post: 15,
  get_dm_lead: 40,
  book_meeting: 60,
  close_pilot: 120,
  publish_demo: 20,
  run_evaluation: 30,
  fix_bug: 30,
} as const;

// Level calculation helpers
export function calculateLevel(totalXP: number): { level: number; xpToNext: number; progress: number } {
  const BASE = 100;
  const INCREMENT = 50;
  
  let level = 1;
  let xpRequired = BASE;
  
  while (totalXP >= xpRequired) {
    level++;
    xpRequired = BASE + INCREMENT * (level - 1);
  }
  
  const xpToNext = xpRequired - totalXP;
  const levelStartXP = level > 1 ? BASE + INCREMENT * (level - 2) : 0;
  const levelRange = INCREMENT;
  const progress = Math.min(((totalXP - levelStartXP) / levelRange) * 100, 100);
  
  return { level, xpToNext: Math.max(xpToNext, 0), progress };
}