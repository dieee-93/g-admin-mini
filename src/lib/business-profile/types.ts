/**
 * Business Profile Types
 */

import type { BusinessCapabilityId, InfrastructureId } from '@/config/types';

export interface UserProfile {
  businessId?: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  selectedCapabilities: BusinessCapabilityId[];
  selectedInfrastructure: InfrastructureId[];
  setupCompleted: boolean;
  isFirstTimeInDashboard: boolean;
  onboardingStep: number;
  completedMilestones?: string[];
}
