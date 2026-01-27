import React from 'react';
/**
 * Main - Semantic Main Element
 *
 * LAYER 3: Semantic HTML component
 * Proporciona estructura semántica para accesibilidad (WCAG 2.4.1)
 */

interface MainProps {
  children: React.ReactNode;
  id?: string;
}
export function Main({ children, id = 'main-content' }: MainProps) {
  return (
    <main id={id} role="main">
      {children}
    </main>);

}