/**
 * Semantic Components - Layer 3
 *
 * Pure semantic HTML components with ARIA support.
 * Zero styling - only semantics and accessibility.
 *
 * Architecture:
 * - Layer 3: Semantic Components (this layer) - Pure semantics
 * - Layer 2: Layout Components - Styling + composition
 * - Layer 1: Primitives - Low-level Chakra wrappers
 *
 * Best Practices:
 * - Use React 18 useId() for stable SSR/CSR IDs
 * - Follow WAI-ARIA authoring practices
 * - WCAG 2.4.1 Level A compliance (Bypass Blocks)
 * - Semantic HTML5 landmarks
 */

export { Main } from './Main';
export type { MainProps } from './Main';

export { SemanticSection } from './Section';
export type { SemanticSectionProps } from './Section';

export { SkipLink } from './SkipLink';
export type { SkipLinkProps } from './SkipLink';
