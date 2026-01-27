/**
 * Popover Component - ChakraUI v3 Wrapper
 * Floating label that displays rich content when triggered
 */

import {
    Popover as ChakraPopover,
    type PopoverRootProps as ChakraPopoverRootProps
} from '@chakra-ui/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Root Component
// ============================================================================

export interface PopoverRootProps extends ChakraPopoverRootProps { }

export const PopoverRoot = (props: PopoverRootProps) => {
    return <ChakraPopover.Root {...props} />;
};

// ============================================================================
// Trigger Components
// ============================================================================

export interface PopoverTriggerProps extends ComponentProps<typeof ChakraPopover.Trigger> { }

export const PopoverTrigger = (props: PopoverTriggerProps) => {
    return <ChakraPopover.Trigger {...props} />;
};

export interface PopoverAnchorProps extends ComponentProps<typeof ChakraPopover.Anchor> { }

export const PopoverAnchor = (props: PopoverAnchorProps) => {
    return <ChakraPopover.Anchor {...props} />;
};

// ============================================================================
// Content Components
// ============================================================================

export interface PopoverContentProps extends ComponentProps<typeof ChakraPopover.Content> { }

export const PopoverContent = (props: PopoverContentProps) => {
    return <ChakraPopover.Content {...props} />;
};

export interface PopoverPositionerProps extends ComponentProps<typeof ChakraPopover.Positioner> { }

export const PopoverPositioner = (props: PopoverPositionerProps) => {
    return <ChakraPopover.Positioner {...props} />;
};

export interface PopoverArrowProps extends ComponentProps<typeof ChakraPopover.Arrow> { }

export const PopoverArrow = (props: PopoverArrowProps) => {
    return <ChakraPopover.Arrow {...props} />;
};

export interface PopoverArrowTipProps extends ComponentProps<typeof ChakraPopover.ArrowTip> { }

export const PopoverArrowTip = (props: PopoverArrowTipProps) => {
    return <ChakraPopover.ArrowTip {...props} />;
};

export interface PopoverBodyProps extends ComponentProps<typeof ChakraPopover.Body> { }

export const PopoverBody = (props: PopoverBodyProps) => {
    return <ChakraPopover.Body {...props} />;
};

export interface PopoverHeaderProps extends ComponentProps<typeof ChakraPopover.Header> { }

export const PopoverHeader = (props: PopoverHeaderProps) => {
    return <ChakraPopover.Header {...props} />;
};

export interface PopoverFooterProps extends ComponentProps<typeof ChakraPopover.Footer> { }

export const PopoverFooter = (props: PopoverFooterProps) => {
    return <ChakraPopover.Footer {...props} />;
};

export interface PopoverTitleProps extends ComponentProps<typeof ChakraPopover.Title> { }

export const PopoverTitle = (props: PopoverTitleProps) => {
    return <ChakraPopover.Title {...props} />;
};

export interface PopoverDescriptionProps extends ComponentProps<typeof ChakraPopover.Description> { }

export const PopoverDescription = (props: PopoverDescriptionProps) => {
    return <ChakraPopover.Description {...props} />;
};

export interface PopoverCloseTriggerProps extends ComponentProps<typeof ChakraPopover.CloseTrigger> { }

export const PopoverCloseTrigger = (props: PopoverCloseTriggerProps) => {
    return <ChakraPopover.CloseTrigger {...props} />;
};

// ============================================================================
// Re-export as named exports for convenience
// ============================================================================

export const Popover = {
    Root: PopoverRoot,
    Trigger: PopoverTrigger,
    Anchor: PopoverAnchor,
    Content: PopoverContent,
    Positioner: PopoverPositioner,
    Arrow: PopoverArrow,
    ArrowTip: PopoverArrowTip,
    Body: PopoverBody,
    Header: PopoverHeader,
    Footer: PopoverFooter,
    Title: PopoverTitle,
    Description: PopoverDescription,
    CloseTrigger: PopoverCloseTrigger
};
