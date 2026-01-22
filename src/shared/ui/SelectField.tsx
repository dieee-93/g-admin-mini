/**
 * SELECT FIELD - Universal Chakra UI v3 Select Wrapper
 *
 * Wrapper unificado para Select avanzado de Chakra
 * Soporta todas las props nativas de Select.Root
 *
 * Para select HTML nativo simple, usar NativeSelect directamente
 */

import { Select, createListCollection, Portal, Text } from '@chakra-ui/react'
import { forwardRef, useMemo, memo } from 'react';
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

export const SelectField = memo(function SelectField({
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
  const collection = useMemo(() => {
    if (collectionProp) return collectionProp

    if (options) {
      return createListCollection({
        items: options.map(opt => ({
          value: opt.value.toString(),
          label: opt.label,
          disabled: opt.disabled
        }))
      })
    }

    return undefined
  }, [collectionProp, options])

  if (!collection) {
    console.warn('SelectField: Debes proporcionar "options" o "collection"')
    return null
  }

  const selectContent = (
    <Select.Positioner>
      <Select.Content bg="bg.surface">
        {collection.items.map((item: unknown) => {
          const typedItem = item as CollectionOption
          return (
            <Select.Item
              item={typedItem}
              key={typedItem.value}
              _hover={{ bg: "bg.muted" }}
              cursor="pointer"
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
          <Select.Label color="text.secondary">
            {label}
            {required && <Text as="span" color="status.error" ml="1">*</Text>}
          </Select.Label>
        )}
        <Select.Control>
          <Select.Trigger bg="bg.surface" color="text.primary" borderColor="border.default">
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        {noPortal ? selectContent : <Portal>{selectContent}</Portal>}
      </Select.Root>

      {error && (
        <Text color="status.error" fontSize="sm" mt="1">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text color="text.muted" fontSize="sm" mt="1">
          {helperText}
        </Text>
      )}
    </div>
  )
})

// Re-export para compatibilidad
export { createListCollection }
