/**
 * Business Model Mapping Utilities for G-Admin v3.0
 * Functions for mapping between business models and capabilities
 */

import type { BusinessCapability } from '../types/BusinessCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelCapabilities } from '../types/BusinessCapabilities';
import { businessModelDefinitions, migrationPaths } from '../types/BusinessModels';


/**
 * Detect business model from capabilities
 */
export const detectBusinessModel = (capabilities: BusinessCapability[]): BusinessModel => {
  // Score each business model based on capability match
  const scores: Array<{ model: BusinessModel; score: number; coverage: number }> = [];

  Object.entries(businessModelCapabilities).forEach(([model, required]) => {
    const matches = required.filter(cap => capabilities.includes(cap)).length;
    const coverage = required.length > 0 ? (matches / required.length) * 100 : 0;

    // Bonus for exact or near-exact matches
    let score = matches;
    if (coverage >= 90) score += 10;
    if (coverage >= 75) score += 5;

    scores.push({
      model: model as BusinessModel,
      score,
      coverage
    });
  });

  // Sort by score and coverage
  scores.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.coverage - a.coverage;
  });

  // Return the best match, fallback to custom if no good match
  const bestMatch = scores[0];
  return bestMatch && bestMatch.coverage >= 50 ? bestMatch.model : 'custom';
};

/**
 * Get business model evolution suggestions
 */
export const getBusinessModelEvolution = (
  currentModel: BusinessModel,
  currentCapabilities: BusinessCapability[]
): {
  nextSteps: BusinessModel[];
  requirements: Record<BusinessModel, BusinessCapability[]>;
  recommendations: Array<{
    model: BusinessModel;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
    missingCapabilities: BusinessCapability[];
  }>;
} => {
  const nextSteps = migrationPaths[currentModel] || [];
  const requirements: Record<BusinessModel, BusinessCapability[]> = {};
  const recommendations: Array<{
    model: BusinessModel;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
    missingCapabilities: BusinessCapability[];
  }> = [];

  nextSteps.forEach(model => {
    const required = businessModelCapabilities[model] || [];
    const missing = required.filter(cap => !currentCapabilities.includes(cap));

    requirements[model] = missing;

    // Determine difficulty based on missing capabilities
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (missing.length > 5) difficulty = 'hard';
    else if (missing.length > 2) difficulty = 'medium';

    // Generate reason based on model characteristics
    const definition = businessModelDefinitions[model];
    let reason = `Expand to ${definition.name}`;

    if (model === 'ecommerce' && currentModel === 'retail') {
      reason = 'Add online sales channel to reach more customers';
    } else if (model === 'b2b' && currentModel === 'retail') {
      reason = 'Target business customers for larger orders';
    } else if (model === 'subscription' && ['services', 'fitness'].includes(currentModel)) {
      reason = 'Create recurring revenue streams';
    }

    recommendations.push({
      model,
      reason,
      difficulty,
      missingCapabilities: missing
    });
  });

  // Sort recommendations by difficulty and potential impact
  recommendations.sort((a, b) => {
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  return {
    nextSteps,
    requirements,
    recommendations
  };
};

/**
 * Calculate business model readiness score
 */
export const calculateBusinessModelReadiness = (
  targetModel: BusinessModel,
  currentCapabilities: BusinessCapability[]
): {
  score: number;
  readiness: 'not-ready' | 'partially-ready' | 'mostly-ready' | 'ready';
  missing: BusinessCapability[];
  next: BusinessCapability[];
} => {
  const required = businessModelCapabilities[targetModel] || [];
  const missing = required.filter(cap => !currentCapabilities.includes(cap));
  const score = required.length > 0 ? ((required.length - missing.length) / required.length) * 100 : 100;

  let readiness: 'not-ready' | 'partially-ready' | 'mostly-ready' | 'ready';
  if (score >= 95) readiness = 'ready';
  else if (score >= 75) readiness = 'mostly-ready';
  else if (score >= 40) readiness = 'partially-ready';
  else readiness = 'not-ready';

  // Get next logical capabilities to implement
  const next = missing.slice(0, 3); // Next 3 most important

  return { score, readiness, missing, next };
};

/**
 * Get business model compatibility matrix
 */
export const getBusinessModelCompatibility = (
  currentCapabilities: BusinessCapability[]
): Record<BusinessModel, {
  compatibility: number;
  status: 'compatible' | 'partially-compatible' | 'incompatible';
  missing: BusinessCapability[];
}> => {
  const matrix: Record<string, any> = {};

  Object.entries(businessModelCapabilities).forEach(([model, required]) => {
    const missing = required.filter(cap => !currentCapabilities.includes(cap));
    const compatibility = required.length > 0 ? ((required.length - missing.length) / required.length) * 100 : 100;

    let status: 'compatible' | 'partially-compatible' | 'incompatible';
    if (compatibility >= 80) status = 'compatible';
    else if (compatibility >= 40) status = 'partially-compatible';
    else status = 'incompatible';

    matrix[model] = { compatibility, status, missing };
  });

  return matrix as Record<BusinessModel, {
    compatibility: number;
    status: 'compatible' | 'partially-compatible' | 'incompatible';
    missing: BusinessCapability[];
  }>;
};

/**
 * Suggest business model based on industry/business type
 */
export const suggestBusinessModelByIndustry = (industry: string): BusinessModel[] => {
  const industryMapping: Record<string, BusinessModel[]> = {
    'restaurant': ['restaurant'],
    'food': ['restaurant', 'ecommerce'],
    'retail': ['retail', 'ecommerce'],
    'healthcare': ['healthcare', 'services'],
    'fitness': ['fitness'],
    'education': ['education', 'subscription'],
    'consulting': ['services', 'subscription'],
    'software': ['subscription', 'b2b'],
    'manufacturing': ['b2b', 'retail'],
    'real-estate': ['services', 'rental'],
    'automotive': ['services', 'retail'],
    'beauty': ['services', 'retail'],
    'entertainment': ['events', 'services'],
    'logistics': ['b2b', 'services']
  };

  const industryLower = industry.toLowerCase();

  // Find matching industry
  for (const [key, models] of Object.entries(industryMapping)) {
    if (industryLower.includes(key)) {
      return models;
    }
  }

  // Default suggestions for unknown industries
  return ['retail', 'services', 'custom'];
};