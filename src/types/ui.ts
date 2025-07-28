import type { ColorScheme } from "./app";

// src/types/ui.ts
export interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  stats?: {
    value: string | number;
    label: string;
  };
  color?: ColorScheme;
  disabled?: boolean;
  onNavigate: () => void;
}

export interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color?: ColorScheme;
  loading?: boolean;
}

export interface ModuleHeaderProps {
  title: string;
  color: ColorScheme;
  onBack: () => void;
}