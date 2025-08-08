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
}

export function CircularProgress({
  value,
  size = "60px",
  color = "blue.500",
  trackColor = "gray.200",
  strokeWidth = 4,
  children,
  showValueText = false,
  valueText
}: CircularProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const sizeValue = typeof size === 'string' ? parseInt(size) : size;
  const radius = (sizeValue - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // Convert color to actual CSS value
  const getColorValue = (colorProp: string) => {
    if (colorProp.includes('.')) {
      // Handle Chakra colors like 'blue.500'
      const [colorName, shade] = colorProp.split('.');
      const colorMap: Record<string, Record<string, string>> = {
        blue: { '500': '#3182ce' },
        green: { '500': '#38a169' },
        red: { '500': '#e53e3e' },
        yellow: { '500': '#d69e2e' },
        gray: { '200': '#e2e8f0', '500': '#718096' },
      };
      return colorMap[colorName]?.[shade] || '#3182ce';
    }
    return colorProp;
  };

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
          stroke={getColorValue(trackColor)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          stroke={getColorValue(color)}
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
          <Text fontSize="sm" fontWeight="bold">
            {valueText || `${Math.round(normalizedValue)}%`}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

// Compatibility components for drop-in replacement
export const CircularProgressRoot = CircularProgress;

export const CircularProgressValueText: React.FC<{ children?: React.ReactNode; fontSize?: string; fontWeight?: string; color?: string }> = ({ 
  children, 
  fontSize = "sm", 
  fontWeight = "bold",
  color = "inherit" 
}) => (
  <Text fontSize={fontSize} fontWeight={fontWeight} color={color}>
    {children}
  </Text>
);

export const CircularProgressCircle: React.FC<{ stroke?: string }> = () => null; // Placeholder for compatibility