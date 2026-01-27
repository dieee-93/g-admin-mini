import React, { Component } from 'react';
/**
 * TextareaField - Textarea Component
 *
 * Textarea estandarizado con validación integrada.
 */

import {
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  FormHelperText } from
'@chakra-ui/react';
export interface TextareaFieldProps {
  /**
   * Label del campo
   */
  label: string;
  /**
   * Valor del textarea
   */
  value: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
   * Número de filas
   */
  rows?: number;
  /**
   * Tamaño del textarea
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * ID del textarea
   */
  id?: string;
  /**
   * Name del textarea
   */
  name?: string;
  /**
   * Resize behavior
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  size = 'md',
  id,
  name,
  resize = 'vertical'
}: TextareaFieldProps) {
  const textareaId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const isInvalid = !!error;
  return (
    <FormControl
      isInvalid={isInvalid}
      isRequired={required}
      isDisabled={disabled}>

      <FormLabel
        htmlFor={textareaId}
        fontSize="sm"
        fontWeight="medium"
        color="text.primary"
        mb="2">

        {label}
      </FormLabel>

      <Textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        size={size}
        resize={resize}
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
        }} />


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