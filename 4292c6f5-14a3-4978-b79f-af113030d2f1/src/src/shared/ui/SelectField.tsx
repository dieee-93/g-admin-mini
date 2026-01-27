import React, { Component } from 'react';
/**
 * SelectField - Select/Dropdown Component
 *
 * Select estandarizado con validación integrada.
 */

import {
  FormControl,
  FormLabel,
  Select,
  FormErrorMessage,
  FormHelperText } from
'@chakra-ui/react';
export interface SelectOption {
  value: string;
  label: string;
}
export interface SelectFieldProps {
  /**
   * Label del campo
   */
  label: string;
  /**
   * Valor seleccionado
   */
  value: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Opciones del select
   */
  options: SelectOption[];
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Mensaje de error
   */
  error?: string;
  /**
   * Texto de ayuda
   */
  helperText?: string;
  /**
   * Campo requerido
   */
  required?: boolean;
  /**
   * Campo deshabilitado
   */
  disabled?: boolean;
  /**
   * Tamaño del select
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * ID del select
   */
  id?: string;
  /**
   * Name del select
   */
  name?: string;
}
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  id,
  name
}: SelectFieldProps) {
  const selectId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const isInvalid = !!error;
  return (
    <FormControl
      isInvalid={isInvalid}
      isRequired={required}
      isDisabled={disabled}>

      <FormLabel
        htmlFor={selectId}
        fontSize="sm"
        fontWeight="medium"
        color="text.primary"
        mb="2">

        {label}
      </FormLabel>

      <Select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={size}
        bg="bg.surface"
        borderColor={isInvalid ? 'red.500' : 'gray.200'}
        _hover={{
          borderColor: isInvalid ? 'red.600' : 'gray.300'
        }}
        _focus={{
          borderColor: isInvalid ? 'red.600' : 'blue.500',
          boxShadow: isInvalid ?
          '0 0 0 1px var(--chakra-colors-red-500)' :
          '0 0 0 1px var(--chakra-colors-blue-500)'
        }}>

        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </Select>

      {error &&
      <FormErrorMessage fontSize="sm" mt="2">
          {error}
        </FormErrorMessage>
      }

      {helperText && !error &&
      <FormHelperText fontSize="sm" color="text.secondary" mt="2">
          {helperText}
        </FormHelperText>
      }
    </FormControl>);

}