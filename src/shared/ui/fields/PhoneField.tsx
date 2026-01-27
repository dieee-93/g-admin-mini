/**
 * PhoneField - Specialized input for Argentine landline phones
 * 
 * Features:
 * - Area code selector (011, 0221, 0351, etc.)
 * - Automatic formatting: XXXX-XXXX
 * - Phone icon
 * - Full react-hook-form compatibility
 * 
 * @example
 * <PhoneField
 *   label="Teléfono fijo"
 *   areaCode="011"
 *   onAreaCodeChange={(code) => setAreaCode(code)}
 *   {...register('phone')}
 * />
 */

import { forwardRef, memo, useCallback, useState, type ChangeEvent } from 'react';
import { Input as ChakraInput, Field, HStack, NativeSelect } from '@chakra-ui/react';
import { PhoneIcon } from '@heroicons/react/24/outline';

// Argentine area codes
export const AREA_CODES = [
    { code: '011', label: 'Buenos Aires (011)' },
    { code: '0221', label: 'La Plata (0221)' },
    { code: '0223', label: 'Mar del Plata (0223)' },
    { code: '0261', label: 'Mendoza (0261)' },
    { code: '0341', label: 'Rosario (0341)' },
    { code: '0351', label: 'Córdoba (0351)' },
    { code: '0379', label: 'Corrientes (0379)' },
    { code: '0381', label: 'S.M. de Tucumán (0381)' },
    { code: '0387', label: 'Salta (0387)' },
    { code: '0388', label: 'S.S. de Jujuy (0388)' },
] as const;

interface PhoneFieldProps {
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
    size?: 'sm' | 'md' | 'lg';
    /** Pre-selected area code */
    areaCode?: string;
    /** Handler for area code changes */
    onAreaCodeChange?: (code: string) => void;
    /** Hide area code selector */
    hideAreaCode?: boolean;
}

// Format phone: 12345678 → 1234-5678
const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
};

// Remove formatting
const cleanPhone = (value: string): string => {
    return value.replace(/\D/g, '');
};

const PhoneFieldComponent = forwardRef<HTMLInputElement, PhoneFieldProps>(({
    label,
    placeholder = '1234-5678',
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    error,
    helperText,
    required = false,
    disabled = false,
    size = 'md',
    areaCode = '011',
    onAreaCodeChange,
    hideAreaCode = false,
}, ref) => {
    const [selectedAreaCode, setSelectedAreaCode] = useState(areaCode);
    const [displayValue, setDisplayValue] = useState(() => {
        const initial = value || defaultValue || '';
        return formatPhone(initial);
    });

    const handleAreaCodeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setSelectedAreaCode(newCode);
        onAreaCodeChange?.(newCode);
    }, [onAreaCodeChange]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleaned = cleanPhone(rawValue);

        // Limit to 8 digits (Argentine landline)
        if (cleaned.length > 8) return;

        setDisplayValue(formatPhone(cleaned));

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
    }, [onChange, name]);

    const currentValue = value !== undefined ? formatPhone(value) : displayValue;

    return (
        <Field.Root invalid={!!error} width="100%">
            {label && (
                <Field.Label fontSize="sm" fontWeight="medium">
                    {label}
                    {required && <span style={{ marginLeft: '4px', color: 'var(--chakra-colors-red-500)' }}>*</span>}
                </Field.Label>
            )}
            <HStack gap="2" width="100%">
                {!hideAreaCode && (
                    <NativeSelect.Root size={size} width="140px" flexShrink={0}>
                        <NativeSelect.Field
                            value={selectedAreaCode}
                            onChange={handleAreaCodeChange}
                        >
                            {AREA_CODES.map((ac) => (
                                <option key={ac.code} value={ac.code}>
                                    {ac.code}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                )}
                <HStack flex="1" gap="2" align="center">
                    <PhoneIcon style={{ width: '18px', height: '18px', color: 'var(--chakra-colors-gray-400)', flexShrink: 0 }} />
                    <ChakraInput
                        ref={ref}
                        type="tel"
                        inputMode="numeric"
                        placeholder={placeholder}
                        value={currentValue}
                        onChange={handleChange}
                        onBlur={onBlur}
                        name={name}
                        size={size}
                        disabled={disabled}
                        maxLength={9}
                    />
                </HStack>
            </HStack>
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

PhoneFieldComponent.displayName = 'PhoneField';

export const PhoneField = memo(PhoneFieldComponent);
