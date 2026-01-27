/**
 * DNIField - Specialized input for Argentine National Identity Document
 * 
 * Features:
 * - Only numeric input allowed
 * - Validation for 7-8 digits
 * - Optional formatting with dots (12.345.678)
 * - Document icon
 * - Full react-hook-form compatibility
 * 
 * @example
 * <DNIField
 *   label="DNI"
 *   formatWithDots={true}
 *   {...register('dni')}
 * />
 */

import { forwardRef, memo, useCallback, useState, type ChangeEvent } from 'react';
import { Input as ChakraInput, Field, InputGroup } from '@chakra-ui/react';
import { IdentificationIcon } from '@heroicons/react/24/outline';

interface DNIFieldProps {
    label?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    name?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    /** Format display with dots: 12.345.678 */
    formatWithDots?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

// Format DNI with dots: 12345678 → 12.345.678
const formatDNI = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, -3)}.${cleaned.slice(-3)}`;
    return `${cleaned.slice(0, -6)}.${cleaned.slice(-6, -3)}.${cleaned.slice(-3)}`;
};

// Remove dots from DNI
const cleanDNI = (value: string): string => {
    return value.replace(/\D/g, '');
};

const DNIFieldComponent = forwardRef<HTMLInputElement, DNIFieldProps>(({
    label,
    placeholder = '12345678',
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    error,
    helperText = 'Solo números, 7 u 8 dígitos',
    required = false,
    disabled = false,
    formatWithDots = false,
    size = 'md',
}, ref) => {
    // Internal display value (formatted or raw)
    const [displayValue, setDisplayValue] = useState(() => {
        const initial = value || defaultValue || '';
        return formatWithDots ? formatDNI(initial) : initial;
    });

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleaned = cleanDNI(rawValue);

        // Limit to 8 digits
        if (cleaned.length > 8) return;

        // Update display
        setDisplayValue(formatWithDots ? formatDNI(cleaned) : cleaned);

        // Call original onChange with cleaned value
        if (onChange) {
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: cleaned,
                    name: name || ''
                }
            } as ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
    }, [formatWithDots, onChange, name]);

    // Sync with external value changes (from react-hook-form)
    const currentValue = value !== undefined
        ? (formatWithDots ? formatDNI(value) : value)
        : displayValue;

    return (
        <Field.Root invalid={!!error}>
            {label && (
                <Field.Label fontSize="sm" fontWeight="medium">
                    {label}
                    {required && <span style={{ marginLeft: '4px', color: 'var(--chakra-colors-red-500)' }}>*</span>}
                </Field.Label>
            )}
            <InputGroup
                startElement={
                    <IdentificationIcon style={{ width: '18px', height: '18px', color: 'var(--chakra-colors-gray-400)' }} />
                }
            >
                <ChakraInput
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.]*"
                    placeholder={placeholder}
                    value={currentValue}
                    onChange={handleChange}
                    onBlur={onBlur}
                    name={name}
                    size={size}
                    disabled={disabled}
                    maxLength={formatWithDots ? 10 : 8} // 10 with dots, 8 without
                />
            </InputGroup>
            {helperText && !error && (
                <Field.HelperText fontSize="xs">
                    {helperText}
                </Field.HelperText>
            )}
            {error && (
                <Field.ErrorText fontSize="xs">
                    {error}
                </Field.ErrorText>
            )}
        </Field.Root>
    );
});

DNIFieldComponent.displayName = 'DNIField';

export const DNIField = memo(DNIFieldComponent);
