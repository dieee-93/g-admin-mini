import { Box, Image } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface AvatarProps {
  // Avatar content options
  src?: string
  name?: string
  children?: ReactNode
  fallback?: string | ReactNode
  
  // Sizing following modern standards
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  // Styling
  variant?: 'circular' | 'rounded' | 'square'
  colorPalette?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'pink'
  
  // Props
  className?: string
  onClick?: () => void
  loading?: boolean
}

interface AvatarGroupProps {
  children: ReactNode
  max?: number
  size?: AvatarProps['size']
  variant?: AvatarProps['variant']
  className?: string
}

// Modern avatar sizing (following 8px grid + touch targets)
const sizeMap = {
  xs: { width: '24px', height: '24px', fontSize: '10px' },  // 24px - Dense lists
  sm: { width: '32px', height: '32px', fontSize: '12px' },  // 32px - Standard lists
  md: { width: '40px', height: '40px', fontSize: '14px' },  // 40px - Default (44px touch target)
  lg: { width: '48px', height: '48px', fontSize: '16px' },  // 48px - Prominent
  xl: { width: '56px', height: '56px', fontSize: '18px' },  // 56px - Profile headers
  '2xl': { width: '64px', height: '64px', fontSize: '20px' } // 64px - Hero contexts
}

const variantMap = {
  circular: '50%',
  rounded: '8px',
  square: '4px'
}

const colorPaletteMap = {
  gray: { bg: 'gray.500', color: 'white' },
  brand: { bg: 'brand.500', color: 'white' },
  success: { bg: 'success.500', color: 'white' },
  warning: { bg: 'warning.500', color: 'white' },
  error: { bg: 'error.500', color: 'white' },
  info: { bg: 'info.500', color: 'white' },
  theme: { bg: 'brand.500', color: 'white' } // This will be overridden
}

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate deterministic color from name
function getColorFromName(name: string): keyof typeof colorPaletteMap {
  const colors: Array<keyof typeof colorPaletteMap> = ['brand', 'success', 'warning', 'info', 'gray']
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({
  src,
  name = '',
  children,
  fallback,
  size = 'md',
  variant = 'circular',
  colorPalette,
  className,
  onClick,
  loading = false,
  ...rest
}: AvatarProps) {
  const sizeStyles = sizeMap[size]
  const borderRadius = variantMap[variant]
  
  // Determine color palette (explicit > auto-generated > brand default)
  const resolvedColorPalette = colorPalette || (name ? getColorFromName(name) : 'brand')
  
  // ✅ Simplified: Use static colors, dynamic theming handled by recipes
  const colors = colorPaletteMap[resolvedColorPalette]
  
  // Determine fallback content
  const fallbackContent = children || 
    fallback || 
    (name ? getInitials(name) : '?')
  
  if (loading) {
    return (
      <Box
        width={sizeStyles.width}
        height={sizeStyles.height}
        borderRadius={borderRadius}
        className={className}
        animation="pulse 2s ease-in-out infinite"
        {...rest}
      />
    )
  }

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      width={sizeStyles.width}
      height={sizeStyles.height}
      borderRadius={borderRadius}
      bg={colors.bg}
      color={colors.color}
      fontSize={sizeStyles.fontSize}
      fontWeight="semibold"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      className={className}
      overflow="hidden"
      _hover={onClick ? { 
        opacity: 0.8,
        transform: 'scale(1.02)'
      } : {}}
      transition="all 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
      {...rest}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width="100%"
          height="100%"
          objectFit="cover"
          fallback={
            <Box
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {fallbackContent}
            </Box>
          }
        />
      ) : (
        fallbackContent
      )}
    </Box>
  )
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  variant = 'circular',
  className,
}: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children]
  const visibleChildren = childrenArray.slice(0, max)
  const hiddenCount = childrenArray.length - max

  return (
    <Box
      display="flex"
      alignItems="center"
      className={className}
    >
      {visibleChildren.map((child, index) => (
        <Box
          key={index}
          marginLeft={index > 0 ? '-8px' : '0'}
          zIndex={childrenArray.length - index}
          border="2px solid"
          
          borderRadius={variantMap[variant]}
        >
          {child}
        </Box>
      ))}
      {hiddenCount > 0 && (
        <Avatar
          size={size}
          variant={variant}
          colorPalette="gray"
          style={{ marginLeft: '-8px' }}
        >
          +{hiddenCount}
        </Avatar>
      )}
    </Box>
  )
}

// Business-specific avatar components
export function UserAvatar({ 
  user, 
  showStatus = false,
  ...props 
}: { 
  user: { name: string; email?: string; avatar?: string; status?: 'online' | 'offline' | 'away' }
  showStatus?: boolean
} & Omit<AvatarProps, 'name' | 'src'>) {
  return (
    <Box position="relative" display="inline-block">
      <Avatar
        src={user.avatar}
        name={user.name}
        {...props}
      />
      {showStatus && user.status && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width="12px"
          height="12px"
          borderRadius="50%"
          border="2px solid"
          
          bg={
            user.status === 'online' ? 'success.500' :
            user.status === 'away' ? 'warning.500' :
            'gray.400'
          }
        />
      )}
    </Box>
  )
}

// Compound pattern
Avatar.Group = AvatarGroup
Avatar.User = UserAvatar