/**
 * Business Model Mapping Utilities for G-Admin v3.0
 * Functions for mapping between business models and capabilities
 */

import type { BusinessCapability } from '../types/BusinessCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelCapabilities } from '../types/BusinessCapabilities';
import { businessModelDefinitions, migrationPaths } from '../types/BusinessModels';

/**
 * Legacy capability mapping from old system to new system
 * Maps the existing BusinessCapabilities interface to new capability types
 */
export const mapLegacyCapabilities = (
  legacyCapabilities: Record<string, boolean>
): BusinessCapability[] => {
  const capabilities: BusinessCapability[] = [
    'customer_management',
    'dashboard_analytics',
    'system_settings',
    'fiscal_compliance'
  ];

  // Product capabilities
  if (legacyCapabilities.sells_products) {
    capabilities.push('sells_products', 'product_management', 'inventory_tracking');
  }

  if (legacyCapabilities.sells_products_for_onsite_consumption) {
    capabilities.push('sells_products_for_onsite_consumption', 'pos_system', 'table_management');
  }

  if (legacyCapabilities.sells_products_for_pickup) {
    capabilities.push('sells_products_for_pickup');
  }

  if (legacyCapabilities.sells_products_with_delivery) {
    capabilities.push('sells_products_with_delivery', 'delivery_zones', 'driver_management');
  }

  if (legacyCapabilities.sells_digital_products) {
    capabilities.push('sells_digital_products');
  }

  // Service capabilities
  if (legacyCapabilities.sells_services) {
    capabilities.push('sells_services', 'staff_management');
  }

  if (legacyCapabilities.sells_services_by_appointment) {
    capabilities.push('sells_services_by_appointment', 'appointment_booking', 'calendar_integration');
  }

  if (legacyCapabilities.sells_services_by_class) {
    capabilities.push('sells_services_by_class', 'class_scheduling');
  }

  if (legacyCapabilities.sells_space_by_reservation) {
    capabilities.push('sells_space_by_reservation', 'space_booking');
  }

  // Event capabilities
  if (legacyCapabilities.manages_events) {
    capabilities.push('manages_events', 'event_management');
  }

  if (legacyCapabilities.hosts_private_events) {
    capabilities.push('hosts_private_events');
  }

  if (legacyCapabilities.manages_offsite_catering) {
    capabilities.push('manages_offsite_catering');
  }

  // Recurrence capabilities
  if (legacyCapabilities.manages_recurrence) {
    capabilities.push('manages_recurrence', 'recurring_billing');
  }

  if (legacyCapabilities.manages_rentals) {
    capabilities.push('manages_rentals', 'asset_management');
  }

  if (legacyCapabilities.manages_memberships) {
    capabilities.push('manages_memberships');
  }

  if (legacyCapabilities.manages_subscriptions) {
    capabilities.push('manages_subscriptions');
  }

  // Infrastructure capabilities
  if (legacyCapabilities.has_online_store) {
    capabilities.push('has_online_store');
  }

  if (legacyCapabilities.is_b2b_focused) {
    capabilities.push('is_b2b_focused', 'supplier_management');
  }

  // Payment gateway for any selling capability
  if (legacyCapabilities.sells_products || legacyCapabilities.sells_services) {
    capabilities.push('payment_gateway');
  }

  // Staff scheduling for service businesses
  if (legacyCapabilities.sells_services_by_appointment || legacyCapabilities.sells_services_by_class) {
    capabilities.push('staff_scheduling');
  }

  // QR ordering for restaurants
  if (legacyCapabilities.sells_products_for_onsite_consumption) {
    capabilities.push('qr_ordering');
  }

  return [...new Set(capabilities)]; // Remove duplicates
};

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