/**
 * UI Helpers - Layer 2.5
 *
 * Composition helpers for common patterns.
 * Simplifies ChakraUI v3 components while maintaining accessibility.
 *
 * Why helpers instead of semantic components?
 * - ChakraUI v3 already has excellent accessibility built-in
 * - Helpers add: auto-generated IDs, simplified API, common patterns
 * - Zero duplication - delegates to ChakraUI primitives
 *
 * Architecture:
 * - Layer 3: Semantic Components (Main, Section, SkipLink)
 * - Layer 2.5: Helpers (Dialog, Form) ← You are here
 * - Layer 2: Layout Components (ContentLayout, Section)
 * - Layer 1: Primitives (ChakraUI wrappers)
 */

export { Dialog } from './Dialog';
export { Form } from './Form';
