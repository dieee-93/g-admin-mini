/**
 * SELECT FIELD - Universal Chakra UI v3 Select Wrapper
 *
 * Wrapper unificado para Select avanzado de Chakra
 * Soporta todas las props nativas de Select.Root
 *
 * Para select HTML nativo simple, usar NativeSelect directamente
 */

import { Select, createListCollection, Portal } from '@chakra-ui/react'
import type { SelectRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// Tipo para opciones simples
interface SimpleOption {
  value: string | number
  label: string
  disabled?: boolean
}

// Tipo para opciones con colección (patrón Chakra completo)
interface CollectionOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
  [key: string]: any
}

interface SelectFieldProps extends Omit<SelectRootProps, 'collection'> {
  label?: string
  placeholder?: string

  // Opciones simples (modo básico)
  options?: Array<SimpleOption>

  // Colección Chakra (modo avanzado)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection?: any

  error?: string
  helperText?: string
  required?: boolean

  // Renderizado custom
  children?: ReactNode
  renderItem?: (item: CollectionOption) => ReactNode

  // Para usar dentro de Dialogs/Modals donde Portal puede causar problemas
  noPortal?: boolean
}

export function SelectField({
  label,
  placeholder = "Selecciona una opción",
  options,
  collection: collectionProp,
  error,
  helperText,
  required = false,
  renderItem,
  children,
  noPortal = false,
  // Todas las props de Select.Root
  value,
  defaultValue,
  onValueChange,
  disabled,
  invalid,
  size = 'md',
  variant = 'outline',
  colorPalette,
  positioning,
  multiple,
  closeOnSelect,
  deselectable,
  name,
  ...restProps
}: SelectFieldProps) {
  // Si se pasan opciones simples, crear colección
  const collection = collectionProp || (options ? createListCollection({
    items: options.map(opt => ({
      value: opt.value.toString(),
      label: opt.label,
      disabled: opt.disabled
    }))
  }) : undefined)

  if (!collection) {
    console.warn('SelectField: Debes proporcionar "options" o "collection"')
    return null
  }

  const selectContent = (
    <Select.Positioner>
      <Select.Content>
        {collection.items.map((item: unknown) => {
          const typedItem = item as CollectionOption
          return (
            <Select.Item
              item={typedItem}
              key={typedItem.value}
            >
              {renderItem ? renderItem(typedItem) : typedItem.label}
              <Select.ItemIndicator />
            </Select.Item>
          )
        })}
        {children}
      </Select.Content>
    </Select.Positioner>
  )

  return (
    <div>
      <Select.Root
        collection={collection}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        invalid={invalid || !!error}
        size={size}
        variant={variant}
        colorPalette={colorPalette}
        positioning={positioning}
        multiple={multiple}
        closeOnSelect={closeOnSelect}
        deselectable={deselectable}
        name={name}
        {...restProps}
      >
        <Select.HiddenSelect />
        {label && (
          <Select.Label>
            {label}
            {required && <span style={{ color: 'red', marginLeft: '0.25rem' }}>*</span>}
          </Select.Label>
        )}
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        {noPortal ? selectContent : <Portal>{selectContent}</Portal>}
      </Select.Root>

      {error && (
        <div style={{ color: 'var(--colors-red-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
      {helperText && !error && (
        <div style={{ color: 'var(--colors-gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {helperText}
        </div>
      )}
    </div>
  )
}

// Re-export para compatibilidad
export { createListCollection }
