/**
 * Tooltip Examples - Usage Guide
 *
 * Comprehensive examples of Tooltip wrapper usage
 */

import { Tooltip, Button, Box, Text, Badge } from '@/shared/ui'
import { QuestionMarkCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

// ============================================
// BASIC EXAMPLES
// ============================================

/**
 * Example 1: Basic Tooltip
 */
export function BasicTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button>Hover over me</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          This is a basic tooltip!
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 2: Tooltip with Arrow
 */
export function TooltipWithArrowExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button>Tooltip with arrow</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          I have an arrow pointing to the trigger
        </Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 3: Icon with Tooltip (Help Icon Pattern)
 */
export function IconTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Box
          as="button"
          display="inline-flex"
          cursor="help"
          color="fg.muted"
          _hover={{ color: 'blue.500' }}
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </Box>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          Click the help icon to learn more about this feature
        </Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// POSITIONING EXAMPLES
// ============================================

/**
 * Example 4: Different Placements
 */
export function PlacementExamples() {
  const placements: Array<{
    placement: 'top' | 'bottom' | 'left' | 'right'
    label: string
  }> = [
    { placement: 'top', label: 'Top' },
    { placement: 'bottom', label: 'Bottom' },
    { placement: 'left', label: 'Left' },
    { placement: 'right', label: 'Right' },
  ]

  return (
    <Box display="flex" gap="4" flexWrap="wrap">
      {placements.map(({ placement, label }) => (
        <Tooltip.Root key={placement} positioning={{ placement }}>
          <Tooltip.Trigger>
            <Button>{label} Placement</Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Tooltip positioned at {placement}
            </Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
          </Tooltip.Positioner>
        </Tooltip.Root>
      ))}
    </Box>
  )
}

/**
 * Example 5: Custom Offset
 */
export function CustomOffsetExample() {
  return (
    <Tooltip.Root
      positioning={{
        placement: 'top',
        offset: { x: 20, y: 10 }
      }}
    >
      <Tooltip.Trigger>
        <Button>Custom Offset</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          This tooltip has a custom offset (x: 20px, y: 10px)
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// TIMING & INTERACTION
// ============================================

/**
 * Example 6: Delayed Tooltip
 */
export function DelayedTooltipExample() {
  return (
    <Tooltip.Root openDelay={500} closeDelay={200}>
      <Tooltip.Trigger>
        <Button>Delayed Tooltip (500ms)</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          This tooltip appears after 500ms delay
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 7: Interactive Tooltip
 */
export function InteractiveTooltipExample() {
  return (
    <Tooltip.Root interactive={true}>
      <Tooltip.Trigger>
        <Button>Interactive Tooltip</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Box>
            <Text fontWeight="bold" mb="2">You can interact with this!</Text>
            <Button size="sm" colorPalette="blue" onClick={() => alert('Clicked!')}>
              Click Me
            </Button>
          </Box>
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 8: Disabled Tooltip
 */
export function DisabledTooltipExample() {
  return (
    <Tooltip.Root disabled={true}>
      <Tooltip.Trigger>
        <Button>Disabled Tooltip</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          This tooltip is disabled and won't show
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// STYLING EXAMPLES
// ============================================

/**
 * Example 9: Styled Tooltip
 */
export function StyledTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button>Custom Styled</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content
          bg="gray.800"
          color="white"
          p="4"
          borderRadius="lg"
          fontSize="md"
          maxW="400px"
          boxShadow="xl"
        >
          <Text fontWeight="bold" mb="1">
            Custom Styling
          </Text>
          <Text fontSize="sm">
            This tooltip has custom background, padding, border radius, and more!
          </Text>
        </Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 10: Multiline Content
 */
export function MultilineTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Button>Multiline Tooltip</Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content maxW="300px">
          <Box>
            <Text fontWeight="bold" mb="2">
              Feature Name
            </Text>
            <Text fontSize="sm" mb="2">
              This is a detailed explanation of the feature that spans multiple lines.
              It provides comprehensive information to the user.
            </Text>
            <Badge colorPalette="blue" size="sm">
              New Feature
            </Badge>
          </Box>
        </Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// ACCESSIBILITY EXAMPLES
// ============================================

/**
 * Example 11: Accessible Tooltip
 */
export function AccessibleTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        aria-label="Information about this feature"
        tabIndex={0}
      >
        <Box
          as="button"
          display="inline-flex"
          cursor="help"
        >
          <InformationCircleIcon className="w-6 h-6" />
        </Box>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content
          role="tooltip"
          aria-live="polite"
        >
          This tooltip is fully accessible with proper ARIA attributes
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// REAL-WORLD PATTERNS
// ============================================

/**
 * Example 12: Form Field Helper
 */
export function FormFieldHelperExample() {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap="2" mb="2">
        <Text fontWeight="medium">Email Address</Text>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Box
              as="button"
              display="inline-flex"
              cursor="help"
              color="fg.muted"
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
            </Box>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content maxW="250px">
              We'll use this email to send you notifications and important updates.
              We never share your email with third parties.
            </Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Box>
      <input
        type="email"
        placeholder="your@email.com"
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </Box>
  )
}

/**
 * Example 13: Status Badge with Tooltip
 */
export function StatusBadgeTooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Badge colorPalette="green" cursor="help">
          Active
        </Badge>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          This item is currently active and available for use
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

/**
 * Example 14: Truncated Text with Full Text Tooltip
 */
export function TruncatedTextTooltipExample() {
  const longText = "This is a very long text that will be truncated in the UI but shown in full in the tooltip"

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Text
          maxW="200px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          cursor="help"
        >
          {longText}
        </Text>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content maxW="300px">
          {longText}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

// ============================================
// COMPOUND EXAMPLE
// ============================================

/**
 * Example 15: Complete Dashboard Card with Tooltips
 */
export function DashboardCardExample() {
  return (
    <Box
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      maxW="300px"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="3">
        <Text fontWeight="bold" fontSize="lg">
          Total Sales
        </Text>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Box
              as="button"
              display="inline-flex"
              cursor="help"
              color="fg.muted"
            >
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </Box>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content maxW="250px">
              Total sales for the current month, including all payment methods
            </Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Box>

      <Text fontSize="3xl" fontWeight="bold" mb="1">
        $24,567
      </Text>

      <Box display="flex" alignItems="center" gap="2">
        <Badge colorPalette="green">+12.5%</Badge>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Text fontSize="sm" color="fg.muted" cursor="help">
              vs last month
            </Text>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Compared to $21,834 in the previous month
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Box>
    </Box>
  )
}
