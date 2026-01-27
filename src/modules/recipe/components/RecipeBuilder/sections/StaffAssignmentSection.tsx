/**
 * StaffAssignmentSection - Industrial wrapper for StaffSelector
 *
 * Simple industrial-styled container that integrates the existing
 * StaffSelector component with production order aesthetics.
 *
 * Features:
 * - Industrial container with cyan gradient top bar
 * - Subtotal display with monospace typography
 * - Heavy borders and professional manufacturing feel
 *
 * Architecture:
 * - Wrapper around existing StaffSelector (no duplication)
 * - Follows industrial design system
 * - Uses semantic tokens exclusively
 */

import { memo, useMemo } from 'react';
import { Box, Stack, Typography } from '@/shared/ui';
import { StaffSelector } from '@/shared/components/StaffSelector/StaffSelector';
import type { StaffAssignment } from '@/shared/components/StaffSelector/types';

// ============================================
// PROPS
// ============================================

interface StaffAssignmentSectionProps {
  staffAssignments: StaffAssignment[];
  onStaffChange: (assignments: StaffAssignment[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

// ============================================
// COMPONENT
// ============================================

/**
 * StaffAssignmentSection - Industrial staff assignment interface
 *
 * @component
 * @description
 * Industrial production order section for assigning staff to recipes.
 * Wraps the existing StaffSelector with heavy borders, gradient accents,
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
 * <StaffAssignmentSection
 *   staffAssignments={recipe.staffAssignments || []}
 *   onStaffChange={(assignments) => updateRecipe({ staffAssignments: assignments })}
 * />
 * ```
 *
 * @param {StaffAssignmentSectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function StaffAssignmentSectionComponent({
  staffAssignments,
  onStaffChange,
  disabled = false,
  readOnly = false
}: StaffAssignmentSectionProps) {

  // Calculate total labor cost from assignments
  const totalLaborCost = useMemo(() => {
    return staffAssignments.reduce((sum, assignment) => {
      return sum + (assignment.total_cost || 0);
    }, 0);
  }, [staffAssignments]);

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

        {/* StaffSelector Integration */}
        <StaffSelector
          value={staffAssignments}
          onChange={onStaffChange}
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
        {staffAssignments.length > 0 && (
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
export const StaffAssignmentSection = memo(StaffAssignmentSectionComponent);
