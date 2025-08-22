import { Badge } from '../Badge'
import { HStack } from '../Stack'
import { Typography } from '../Typography'

interface InventoryItem {
  id: string
  name: string
  current: number
  minimum: number
  maximum?: number
  unit: string
  category: string
  lastUpdated: string
  supplier?: string
  costPerUnit?: number
}

interface InventoryAlertBadgeProps {
  item: InventoryItem
  variant?: 'simple' | 'detailed' | 'compact'
  showValue?: boolean
  showPercentage?: boolean
  showUnit?: boolean
  showCategory?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
}

interface InventoryStatusSummaryProps {
  items: InventoryItem[]
  variant?: 'badges' | 'summary' | 'detailed'
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

const getStockLevel = (current: number, minimum: number, maximum?: number) => {
  if (current === 0) return 'out'
  if (current <= minimum * 0.5) return 'critical'
  if (current <= minimum) return 'low'
  if (maximum && current >= maximum) return 'excess'
  return 'good'
}

const getStockPercentage = (current: number, minimum: number) => {
  if (minimum === 0) return 100
  return Math.round((current / minimum) * 100)
}

const formatNumber = (num: number, decimals = 0) => {
  return new Intl.NumberFormat('es-AR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  }).format(num)
}

export function InventoryAlertBadge({
  item,
  variant = 'simple',
  showValue = true,
  showPercentage = false,
  showUnit = true,
  showCategory = false,
  interactive = false,
  onClick,
  className,
}: InventoryAlertBadgeProps) {
  const level = getStockLevel(item.current, item.minimum, item.maximum) as 'good' | 'low' | 'critical' | 'out' | 'excess'
  const percentage = getStockPercentage(item.current, item.minimum)
  
  if (variant === 'compact') {
    return (
      <Badge.Stock
        level={level}
        showValue={false}
        size="xs"
        clickable={interactive}
        onClick={onClick}
        className={className}
        title={`${item.name}: ${item.current} ${item.unit} (${percentage}% del mínimo)`}
      />
    )
  }

  if (variant === 'detailed') {
    const levelConfig = {
      good: { color: 'success', label: 'Buen Stock', icon: '✅' },
      low: { color: 'warning', label: 'Stock Bajo', icon: '⚠️' },
      critical: { color: 'error', label: 'Stock Crítico', icon: '🚨' },
      out: { color: 'error', label: 'Sin Stock', icon: '❌' },
      excess: { color: 'info', label: 'Exceso', icon: '📦' },
    }

    const config = levelConfig[level]

    return (
      <Badge
        colorPalette={config.color as any}
        variant="outline"
        size="md"
        clickable={interactive}
        onClick={onClick}
        className={className}
        startIcon={<span>{config.icon}</span>}
        pulse={level === 'critical' || level === 'out'}
      >
        <HStack gap="xs" align="center">
          <Typography variant="caption" weight="medium">
            {item.name}
          </Typography>
          {showValue && (
            <Typography variant="caption">
              {formatNumber(item.current)}
              {showUnit && ` ${item.unit}`}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="caption" color="secondary">
              ({percentage}%)
            </Typography>
          )}
          {showCategory && (
            <Typography variant="caption" color="muted">
              | {item.category}
            </Typography>
          )}
        </HStack>
      </Badge>
    )
  }

  // Variant: simple (default)
  let badgeText = item.name
  if (showValue) {
    badgeText += `: ${formatNumber(item.current)}`
    if (showUnit) badgeText += ` ${item.unit}`
  }
  if (showPercentage) {
    badgeText += ` (${percentage}%)`
  }

  return (
    <Badge.Stock
      level={level}
      clickable={interactive}
      onClick={onClick}
      className={className}
    >
      {badgeText}
    </Badge.Stock>
  )
}

export function InventoryStatusSummary({
  items,
  variant = 'badges',
  maxItems = 5,
  onViewAll,
  className,
}: InventoryStatusSummaryProps) {
  // Clasificar items por nivel de stock
  const itemsByLevel = {
    out: items.filter(item => getStockLevel(item.current, item.minimum, item.maximum) === 'out'),
    critical: items.filter(item => getStockLevel(item.current, item.minimum, item.maximum) === 'critical'),
    low: items.filter(item => getStockLevel(item.current, item.minimum, item.maximum) === 'low'),
    excess: items.filter(item => getStockLevel(item.current, item.minimum, item.maximum) === 'excess'),
    good: items.filter(item => getStockLevel(item.current, item.minimum, item.maximum) === 'good'),
  }

  // Priorizar items críticos para mostrar
  const priorityItems = [
    ...itemsByLevel.out,
    ...itemsByLevel.critical,
    ...itemsByLevel.low,
    ...itemsByLevel.excess
  ].slice(0, maxItems)

  if (variant === 'summary') {
    const totalIssues = itemsByLevel.out.length + itemsByLevel.critical.length + itemsByLevel.low.length
    
    if (totalIssues === 0) {
      return (
        <Badge colorPalette="success" variant="subtle" className={className}>
          ✅ Inventario OK ({items.length} items)
        </Badge>
      )
    }

    return (
      <HStack gap="xs" className={className}>
        {itemsByLevel.out.length > 0 && (
          <Badge.Stock level="out" clickable onClick={onViewAll}>
            {itemsByLevel.out.length} sin stock
          </Badge.Stock>
        )}
        {itemsByLevel.critical.length > 0 && (
          <Badge.Stock level="critical" clickable onClick={onViewAll}>
            {itemsByLevel.critical.length} crítico
          </Badge.Stock>
        )}
        {itemsByLevel.low.length > 0 && (
          <Badge.Stock level="low" clickable onClick={onViewAll}>
            {itemsByLevel.low.length} bajo
          </Badge.Stock>
        )}
        {itemsByLevel.excess.length > 0 && (
          <Badge.Stock level="excess" clickable onClick={onViewAll}>
            {itemsByLevel.excess.length} exceso
          </Badge.Stock>
        )}
      </HStack>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={className}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '8px' 
        }}>
          {priorityItems.map((item) => (
            <InventoryAlertBadge
              key={item.id}
              item={item}
              variant="detailed"
              showValue
              showPercentage
              interactive
              onClick={onViewAll}
            />
          ))}
        </div>
        
        {items.length > maxItems && (
          <Badge
            variant="ghost"
            colorPalette="gray"
            size="sm"
            clickable
            onClick={onViewAll}
            style={{ marginTop: '8px' }}
          >
            Ver todos ({items.length - maxItems} más)
          </Badge>
        )}
      </div>
    )
  }

  // Variant: badges (default)
  return (
    <HStack gap="xs" className={className} style={{ flexWrap: 'wrap' }}>
      {priorityItems.map((item) => (
        <InventoryAlertBadge
          key={item.id}
          item={item}
          variant="simple"
          showValue={false}
          interactive
          onClick={onViewAll}
        />
      ))}
      
      {items.length > maxItems && (
        <Badge
          variant="outline"
          colorPalette="gray"
          size="sm"
          clickable
          onClick={onViewAll}
        >
          +{items.length - maxItems} más
        </Badge>
      )}
    </HStack>
  )
}

// Componente especializado para el header de módulos
export function InventoryHeaderBadge({
  totalItems,
  criticalItems,
  lowStockItems,
  outOfStockItems,
  showCount = true,
  onClick,
  className,
}: {
  totalItems: number
  criticalItems: number
  lowStockItems: number
  outOfStockItems: number
  showCount?: boolean
  onClick?: () => void
  className?: string
}) {
  const totalIssues = criticalItems + lowStockItems + outOfStockItems
  
  if (totalIssues === 0) {
    return showCount ? (
      <Badge colorPalette="success" variant="subtle" className={className}>
        {totalItems} items
      </Badge>
    ) : null
  }

  return (
    <HStack gap="xs" className={className}>
      {outOfStockItems > 0 && (
        <Badge 
          colorPalette="error" 
          variant="solid" 
          size="sm"
          pulse
          clickable
          onClick={onClick}
        >
          {outOfStockItems} agotados
        </Badge>
      )}
      {criticalItems > 0 && (
        <Badge 
          colorPalette="error" 
          variant="outline" 
          size="sm"
          clickable
          onClick={onClick}
        >
          {criticalItems} críticos
        </Badge>
      )}
      {lowStockItems > 0 && (
        <Badge 
          colorPalette="warning" 
          variant="outline" 
          size="sm"
          clickable
          onClick={onClick}
        >
          {lowStockItems} bajos
        </Badge>
      )}
      {showCount && (
        <Badge variant="ghost" colorPalette="gray" size="sm">
          {totalItems} total
        </Badge>
      )}
    </HStack>
  )
}