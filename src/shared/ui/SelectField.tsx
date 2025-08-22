import { Select, createListCollection, Portal } from '@chakra-ui/react'
import { ReactNode } from 'react'

// Tipo para opciones simples
interface SimpleOption {
  value: string | number
  label: string
}

// Tipo para opciones con colección (patrón Chakra completo)
interface CollectionOption {
  value: string | number
  label: string
  description?: string
  [key: string]: any
}

interface SelectFieldProps {
  label?: string
  placeholder?: string
  value?: string | number | string[]
  defaultValue?: string | number | string[]
  onChange?: (value: string | string[]) => void
  onValueChange?: (details: { value: string[] }) => void
  
  // Opciones simples (modo básico)
  options?: Array<SimpleOption>
  
  // Colección Chakra (modo avanzado)
  collection?: ReturnType<typeof createListCollection>
  
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'filled' | 'flushed'
  
  // Estilos del trigger
  height?: string
  width?: string
  
  // Renderizado custom
  children?: ReactNode
  renderItem?: (item: CollectionOption) => ReactNode
  
  // Para usar dentro de Dialogs/Modals donde Portal puede causar problemas
  noPortal?: boolean
}

export function SelectField({
  label,
  placeholder = "Selecciona una opción",
  value,
  defaultValue,
  onChange,
  onValueChange,
  options,
  collection,
  error,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  height = 'auto',
  width = 'full',
  children,
  renderItem,
  noPortal = false,
}: SelectFieldProps) {
  
  // Convertir value a array para compatibilidad con Chakra
  const valueArray = Array.isArray(value) ? value : value ? [value.toString()] : []
  const defaultValueArray = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue.toString()] : []
  
  // Handler unificado para cambios
  const handleValueChange = (details: { value: string[] }) => {
    if (onValueChange) {
      onValueChange(details)
    } else if (onChange) {
      // Para compatibilidad con API simple
      onChange(details.value[0] || '')
    }
  }
  
  // Si se pasan opciones simples, crear colección
  const finalCollection = collection || (options ? createListCollection({
    items: options.map(opt => ({
      value: opt.value.toString(),
      label: opt.label
    }))
  }) : undefined)
  
  if (!finalCollection) {
    console.warn('SelectField: Debes proporcionar "options" o "collection"')
    return null
  }

  return (
    <div>
      <Select.Root
        collection={finalCollection}
        value={valueArray}
        defaultValue={defaultValueArray}
        onValueChange={handleValueChange}
        size={size}
        variant={variant}
        disabled={disabled}
        width={width}
      >
        <Select.HiddenSelect />
        {label && <Select.Label>{label}{required && ' *'}</Select.Label>}
        <Select.Control>
          <Select.Trigger height={height}>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
{noPortal ? (
          <Select.Positioner>
            <Select.Content>
              {finalCollection.items.map((item: any) => (
                <Select.Item item={item} key={item.value}>
                  {renderItem ? renderItem(item) : item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
              {children}
            </Select.Content>
          </Select.Positioner>
        ) : (
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {finalCollection.items.map((item: any) => (
                  <Select.Item item={item} key={item.value}>
                    {renderItem ? renderItem(item) : item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
                {children}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        )}
      </Select.Root>
      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}

// Re-export para compatibilidad
export { createListCollection }