import { useMemo } from 'react';
import { MILESTONE_DEFINITIONS, CAPABILITY_MILESTONE_CONFIG, getMilestoneDefinition } from '../config/milestones';
import type { MilestoneDefinition } from '../pages/admin/gamification/achievements/types';
import { useBusinessProfile } from '@/store/businessCapabilitiesStore'; 
import { getOperationalProfile } from '../pages/setup/steps/business-setup/business-model/config/businessLogic';

/**
 * @interface EvolutionRoute
 * Represents a suggested next step for the user to evolve their business,
 * linking a locked "planet" to the milestone required to unlock it.
 */
export interface EvolutionRoute {
  planetName: string;
  milestone: MilestoneDefinition;
}

/**
 * @hook useEvolutionRoutes
 * Analyzes the user's current business DNA and completed milestones
 * to suggest the next "evolution routes" (i.e., key features to set up).
 *
 * @returns An object containing the top suggested routes and a loading state.
 */
export function useEvolutionRoutes(): { suggestedRoutes: EvolutionRoute[], isLoading: boolean } {
  const { profile, isLoading } = useBusinessProfile();

  const suggestedRoutes = useMemo(() => {
    if (isLoading || !profile) {
      return [];
    }

    const { capabilities, businessStructure, customizations } = profile;
    const completedMilestones = customizations?.milestonesCompleted || [];

    // Determine the full operational profile based on current capabilities
    // Convert businessStructure to array format if it's a single value
    const businessStructureArray = businessStructure ? [businessStructure] : [];
    const fullOperationalProfile = getOperationalProfile(capabilities, businessStructureArray);

    // Find which planets are locked and have an associated milestone
    const lockedPlanets = fullOperationalProfile
      .map(planetName => {
        const capabilityConfig = CAPABILITY_MILESTONE_CONFIG[planetName];
        const milestoneId = capabilityConfig?.milestones?.[0]; // Tomar el primer hito como ejemplo
        const isUnlocked = !milestoneId || completedMilestones.includes(milestoneId);

        return { planetName, isUnlocked, milestoneId };
      })
      .filter(planet => !planet.isUnlocked && planet.milestoneId);

    // Map locked planets to their corresponding milestone data
    const routes: EvolutionRoute[] = lockedPlanets
      .map(planet => {
        const milestone = getMilestoneDefinition(planet.milestoneId!);
        return milestone ? { planetName: planet.planetName, milestone } : null;
      })
      .filter((route): route is EvolutionRoute => route !== null);

    // Sort routes to prioritize "Configuración Esencial"
    routes.sort((a, b) => {
      if (a.milestone.category === 'Configuración Esencial' && b.milestone.category !== 'Configuración Esencial') {
        return -1;
      }
      if (a.milestone.category !== 'Configuración Esencial' && b.milestone.category === 'Configuración Esencial') {
        return 1;
      }
      return 0;
    });

    return routes.slice(0, 3); // Return top 3 suggestions

  }, [profile, isLoading]);

  return { suggestedRoutes, isLoading };
}
