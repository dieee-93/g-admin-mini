// src/components/ui/CircularProgress.tsx
// Functional Circular Progress for ChakraUI v3.23.0

import React from 'react';
import { Box, Text } from '@chakra-ui/react';


interface CircularProgressProps {
  value: number;
  size?: string | number;
  color?: string;
  trackColor?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
  showValueText?: boolean;
  valueText?: string;
  colorPalette?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink';
}

export function CircularProgress({
  value,
  size = "60px",
  color,
  trackColor,
  strokeWidth = 4,
  children,
  showValueText = false,
  valueText,
  colorPalette = 'blue'
}: CircularProgressProps) {

  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const sizeValue = typeof size === 'string' ? parseInt(size) : size;
  const radius = (sizeValue - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // ✅ Use explicit colors - let Chakra's colorPalette handle theming automatically if provided
  const progressColor = color || 'var(--chakra-colors-blue-500)' // Default fallback
  const resolvedTrackColor = trackColor || 'var(--chakra-colors-gray-200)'

  return (
    <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.3s ease'
          }}
        />
      </svg>
      
      {/* Center content */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        textAlign="center"
      >
        {children || (showValueText && (
          <Text fontSize="sm" fontWeight="bold" color={themeTextColor}>
            {valueText || `${Math.round(normalizedValue)}%`}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

// Compatibility components for drop-in replacement
export const CircularProgressRoot = CircularProgress;

export const CircularProgressValueText: React.FC<{ 
  children?: React.ReactNode; 
  fontSize?: string; 
  fontWeight?: string; 
  color?: string;
  useTheme?: boolean; // 🆕 Option to use theme colors
}> = ({ 
  children, 
  fontSize = "sm", 
  fontWeight = "bold",
  color = "inherit",
  useTheme = false
}) => {

  const resolvedColor = useTheme ? 'inherit' : color
  
  return (
    <Text fontSize={fontSize} fontWeight={fontWeight} color={resolvedColor}>
      {children}
    </Text>
  )
}

export const CircularProgressCircle: React.FC<{ stroke?: string }> = () => null; // Placeholder for compatibility