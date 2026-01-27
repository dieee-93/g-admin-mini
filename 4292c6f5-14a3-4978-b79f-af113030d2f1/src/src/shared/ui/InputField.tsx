import React, { Component } from 'react';
/**
 * InputField - Input Component with Label, Error, and Helper Text
 *
 * Input estandarizado con validación integrada.
 * Sigue el patrón de diseño consistente del sistema.
 */

import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText } from
'@chakra-ui/react';
export interface InputFieldProps {
  /**
   * Label del campo
   */
  label: string;
  /**
   * Valor del input
   */
  value: string;
  /**
   * Callback cuando cambia el valor
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Tipo de input
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Mensaje de error (si existe, muestra el campo como inválido)
   */
  error?: string;
  /**
   * Texto de ayuda (se muestra debajo del input)
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
   * Tamaño del input
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * ID del input (para accesibilidad)
   */
  id?: string;
  /**
   * Name del input (para forms)
   */
  name?: string;
}
export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  id,
  name
}: InputFieldProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const isInvalid = !!error;
  return (
    <FormControl
      isInvalid={isInvalid}
      isRequired={required}
      isDisabled={disabled}>

      <FormLabel
        htmlFor={inputId}
        fontSize="sm"
        fontWeight="medium"
        color="text.primary"
        mb="2">

        {label}
      </FormLabel>

      <Input
        id={inputId}
        name={name}
        type={type}
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