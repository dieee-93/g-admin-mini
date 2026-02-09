/**
 * TeamAssignmentSection - Industrial wrapper for TeamSelector
 *
 * Simple industrial-styled container that integrates the existing
 * TeamSelector component with production order aesthetics.
 *
 * Features:
 * - Industrial container with cyan gradient top bar
 * - Subtotal display with monospace typography
 * - Heavy borders and professional manufacturing feel
 *
 * Architecture:
 * - Wrapper around existing TeamSelector (no duplication)
 * - Follows industrial design system
 * - Uses semantic tokens exclusively
 */

import { memo, useMemo } from 'react';
import { Box, Stack, Typography } from '@/shared/ui';
import { TeamSelector } from '@/shared/components/TeamSelector/TeamSelector';
import type {
  TeamSelectorProps,
  TeamAssignment
} from '@/shared/components/TeamSelector/types';

// ============================================
// PROPS
// ============================================

interface TeamAssignmentSectionProps {
  teamAssignments: TeamAssignment[];
  onTeamChange: (assignments: TeamAssignment[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

// ============================================
// COMPONENT
// ============================================

/**
 * TeamAssignmentSection - Industrial team assignment interface
 *
 * @component
 * @description
 * Industrial production order section for assigning team members to recipes.
 * Wraps the existing TeamSelector with heavy borders, gradient accents,
 * and monospace typography for a professional manufacturing aesthetic.
 *
 * Design:
 * - Cyan gradient top bar (4px)
 * - Heavy 3px borders
 * - Monospace subtotal typography
 * - Right-aligned cost display
 *
 * @example
 * ```tsx
 * <TeamAssignmentSection
 *   teamAssignments={recipe.teamAssignments || []}
 *   onTeamChange={(assignments) => updateRecipe({ teamAssignments: assignments })}
 * />
 * ```
 *
 * @param {TeamAssignmentSectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function TeamAssignmentSectionComponent({
  teamAssignments,
  onTeamChange,
  disabled = false,
  readOnly = false
}: TeamAssignmentSectionProps) {

  // Calculate total labor cost from assignments
  const totalLaborCost = useMemo(() => {
    return teamAssignments.reduce((sum, assignment) => {
      return sum + (assignment.total_cost || 0);
    }, 0);
  }, [teamAssignments]);

  return (
    <Box
      position="relative"
      p="6"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      css={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, var(--chakra-colors-cyan-emphasized), var(--chakra-colors-cyan-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        {/* Header */}
        <Typography
          fontSize="xs"
          fontWeight="800"
          color="fg.muted"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Personal Asignado
        </Typography>

        {/* TeamSelector Integration */}
        <TeamSelector
          value={teamAssignments}
          onChange={onTeamChange}
          variant="compact"
          showCost={true}
          disabled={disabled}
          readOnly={readOnly}
          showEmployeeSelector={true}
          showDuration={true}
          showCount={true}
          defaultDuration={60}
        />

        {/* Subtotal - Industrial Style */}
        {teamAssignments.length > 0 && (
          <Box
            textAlign="right"
            pt="3"
            borderTopWidth="2px"
            borderTopColor="border.subtle"
          >
            <Typography
              fontSize="sm"
              fontWeight="800"
              fontFamily="mono"
              color="fg.emphasized"
              letterSpacing="wider"
            >
              SUBTOTAL LABOR: ${totalLaborCost.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// Export memoized version
export const TeamAssignmentSection = memo(TeamAssignmentSectionComponent);
