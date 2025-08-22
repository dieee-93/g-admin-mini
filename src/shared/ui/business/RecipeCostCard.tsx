import { Card } from '../Card'
import { Typography } from '../Typography'
import { Stack, HStack } from '../Stack'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Layout } from '../Layout'

interface RecipeIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
  available: number
  inStock: boolean
}

interface RecipeCostData {
  id: string
  name: string
  category: string
  servings: number
  ingredients: RecipeIngredient[]
  totalCost: number
  costPerServing: number
  suggestedPrice: number
  marginPercentage: number
  preparationTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  lastUpdated: string
}

interface RecipeCostCardProps {
  recipe: RecipeCostData
  variant?: 'compact' | 'detailed' | 'summary'
  showActions?: boolean
  showIngredients?: boolean
  onEdit?: () => void
  onDuplicate?: () => void
  onCalculate?: () => void
  onViewIngredients?: () => void
  className?: string
}

const difficultyConfig = {
  easy: { color: 'success', label: 'Fácil', icon: '👍' },
  medium: { color: 'warning', label: 'Medio', icon: '⚡' },
  hard: { color: 'error', label: 'Difícil', icon: '🔥' },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}min`
}

export function RecipeCostCard({
  recipe,
  variant = 'detailed',
  showActions = true,
  showIngredients = false,
  onEdit,
  onDuplicate,
  onCalculate,
  onViewIngredients,
  className,
}: RecipeCostCardProps) {
  const difficulty = difficultyConfig[recipe.difficulty]
  const outOfStockCount = recipe.ingredients.filter(ing => !ing.inStock).length
  const lowStockCount = recipe.ingredients.filter(ing => ing.inStock && ing.available < ing.quantity).length
  
  const profitMargin = ((recipe.suggestedPrice - recipe.costPerServing) / recipe.suggestedPrice) * 100
  const canProduce = recipe.ingredients.every(ing => ing.inStock && ing.available >= ing.quantity)

  if (variant === 'compact') {
    return (
      <Card 
        variant="outline" 
        interactive 
        padding="sm"
        className={className}
      >
        <HStack justify="space-between" align="center">
          <Stack gap="xs">
            <Typography variant="title" size="sm">{recipe.name}</Typography>
            <HStack gap="sm">
              <Typography variant="caption" color="secondary">
                {recipe.servings} porciones
              </Typography>
              <Typography variant="caption" color="accent" weight="semibold">
                {formatCurrency(recipe.costPerServing)}/porción
              </Typography>
            </HStack>
          </Stack>
          
          <Stack gap="xs" align="end">
            <Badge.Priority priority={recipe.difficulty === 'easy' ? 'low' : recipe.difficulty === 'medium' ? 'medium' : 'high'} />
            {!canProduce && <Badge.Stock level="out" />}
          </Stack>
        </HStack>
      </Card>
    )
  }

  if (variant === 'summary') {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <Card.Header justify="space-between">
          <Stack gap="xs">
            <Typography variant="heading">{recipe.name}</Typography>
            <Typography variant="caption" color="secondary">{recipe.category}</Typography>
          </Stack>
          <Badge 
            colorPalette={difficulty.color as any}
            startIcon={<span>{difficulty.icon}</span>}
          >
            {difficulty.label}
          </Badge>
        </Card.Header>

        <Card.Body padding="sm">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Layout>
              <Typography variant="overline" color="secondary">Costo Total</Typography>
              <Typography variant="title" color="primary">
                {formatCurrency(recipe.totalCost)}
              </Typography>
            </Layout>
            
            <Layout>
              <Typography variant="overline" color="secondary">Por Porción</Typography>
              <Typography variant="title" color="accent">
                {formatCurrency(recipe.costPerServing)}
              </Typography>
            </Layout>
            
            <Layout>
              <Typography variant="overline" color="secondary">Precio Sugerido</Typography>
              <Typography variant="title" color="success">
                {formatCurrency(recipe.suggestedPrice)}
              </Typography>
            </Layout>
            
            <Layout>
              <Typography variant="overline" color="secondary">Margen</Typography>
              <Typography 
                variant="title" 
                color={profitMargin > 50 ? 'success' : profitMargin > 30 ? 'warning' : 'error'}
              >
                {profitMargin.toFixed(1)}%
              </Typography>
            </Layout>
          </div>
        </Card.Body>

        {showActions && (
          <Card.Footer>
            <HStack gap="sm">
              <Button size="sm" variant="outline" onClick={onEdit}>
                Editar
              </Button>
              <Button size="sm" variant="solid" onClick={onCalculate}>
                Recalcular
              </Button>
            </HStack>
          </Card.Footer>
        )}
      </Card>
    )
  }

  // Variant: detailed (default)
  return (
    <Card variant="elevated" padding="none" className={className}>
      <Card.Header justify="space-between">
        <Stack gap="xs">
          <HStack gap="md" align="center">
            <Typography variant="heading">{recipe.name}</Typography>
            <Badge 
              colorPalette={difficulty.color as any}
              startIcon={<span>{difficulty.icon}</span>}
              size="sm"
            >
              {difficulty.label}
            </Badge>
          </HStack>
          
          <HStack gap="lg">
            <Typography variant="caption" color="secondary">
              📂 {recipe.category}
            </Typography>
            <Typography variant="caption" color="secondary">
              🍽️ {recipe.servings} porciones
            </Typography>
            <Typography variant="caption" color="secondary">
              ⏱️ {formatTime(recipe.preparationTime)}
            </Typography>
          </HStack>
        </Stack>

        {showActions && (
          <HStack gap="sm">
            <Button size="sm" variant="ghost" onClick={onDuplicate}>
              Duplicar
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              Editar
            </Button>
          </HStack>
        )}
      </Card.Header>

      <Card.Body>
        {/* Alertas de stock */}
        {(outOfStockCount > 0 || lowStockCount > 0) && (
          <Stack gap="sm" style={{ marginBottom: '16px' }}>
            {outOfStockCount > 0 && (
              <Alert.Inventory
                level="out"
                item={`${outOfStockCount} ingrediente${outOfStockCount > 1 ? 's' : ''}`}
                current={0}
                minimum={1}
                size="sm"
              />
            )}
            {lowStockCount > 0 && (
              <Alert.Inventory
                level="low"
                item={`${lowStockCount} ingrediente${lowStockCount > 1 ? 's' : ''} con stock bajo`}
                current={0}
                minimum={1}
                size="sm"
              />
            )}
          </Stack>
        )}

        {/* Métricas de costo */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <Layout variant="panel" padding="sm">
            <Typography variant="overline" color="secondary">Costo Total</Typography>
            <Typography variant="title" color="primary">
              {formatCurrency(recipe.totalCost)}
            </Typography>
          </Layout>
          
          <Layout variant="panel" padding="sm">
            <Typography variant="overline" color="secondary">Por Porción</Typography>
            <Typography variant="title" color="accent">
              {formatCurrency(recipe.costPerServing)}
            </Typography>
          </Layout>
          
          <Layout variant="panel" padding="sm">
            <Typography variant="overline" color="secondary">Precio Sugerido</Typography>
            <Typography variant="title" color="success">
              {formatCurrency(recipe.suggestedPrice)}
            </Typography>
          </Layout>
          
          <Layout variant="panel" padding="sm">
            <Typography variant="overline" color="secondary">Margen</Typography>
            <Typography 
              variant="title" 
              color={profitMargin > 50 ? 'success' : profitMargin > 30 ? 'warning' : 'error'}
            >
              {profitMargin.toFixed(1)}%
            </Typography>
          </Layout>
        </div>

        {/* Lista de ingredientes */}
        {showIngredients && recipe.ingredients.length > 0 && (
          <Layout variant="panel" padding="sm">
            <Typography variant="label" style={{ marginBottom: '8px' }}>
              Ingredientes ({recipe.ingredients.length})
            </Typography>
            <Stack gap="xs">
              {recipe.ingredients.slice(0, 5).map((ingredient) => (
                <HStack key={ingredient.id} justify="space-between" align="center">
                  <HStack gap="sm">
                    <Typography variant="body" size="sm">
                      {ingredient.name}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {ingredient.quantity} {ingredient.unit}
                    </Typography>
                    {!ingredient.inStock && (
                      <Badge.Stock level="out" size="xs" />
                    )}
                  </HStack>
                  <Typography variant="caption" weight="medium">
                    {formatCurrency(ingredient.totalCost)}
                  </Typography>
                </HStack>
              ))}
              {recipe.ingredients.length > 5 && (
                <Button 
                  size="xs" 
                  variant="ghost" 
                  onClick={onViewIngredients}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Ver todos ({recipe.ingredients.length})
                </Button>
              )}
            </Stack>
          </Layout>
        )}
      </Card.Body>

      <Card.Footer justify="space-between">
        <Typography variant="caption" color="secondary">
          Actualizado: {new Date(recipe.lastUpdated).toLocaleDateString()}
        </Typography>
        
        <HStack gap="sm">
          <Button size="sm" variant="outline" onClick={onViewIngredients}>
            Ver Ingredientes
          </Button>
          <Button 
            size="sm" 
            variant="solid" 
            colorPalette="brand"
            onClick={onCalculate}
          >
            Recalcular Costos
          </Button>
        </HStack>
      </Card.Footer>
    </Card>
  )
}

// Exportar también las dependencias necesarias para que funcione independientemente
export { Alert } from '../Alert'