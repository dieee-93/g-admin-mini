/**
 * MobileField - Specialized input for mobile phones with country code
 * 
 * Features:
 * - Country code selector (+54, +56, +55, etc.)
 * - Automatic formatting
 * - Mobile phone icon
 * - Full react-hook-form compatibility
 * - Full width layout
 * 
 * @example
 * <MobileField
 *   label="Celular"
 *   countryCode="+54"
 *   onCountryCodeChange={(code) => setCountryCode(code)}
 *   {...register('mobile')}
 * />
 */

import { forwardRef, memo, useCallback, useState, type ChangeEvent } from 'react';
import { Input as ChakraInput, Field, HStack, NativeSelect, Box } from '@chakra-ui/react';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

// Country codes for Latin America
export const COUNTRY_CODES = [
    { code: '+54', label: '🇦🇷 Argentina (+54)', country: 'AR' },
    { code: '+55', label: '🇧🇷 Brasil (+55)', country: 'BR' },
    { code: '+56', label: '🇨🇱 Chile (+56)', country: 'CL' },
    { code: '+57', label: '🇨🇴 Colombia (+57)', country: 'CO' },
    { code: '+58', label: '🇻🇪 Venezuela (+58)', country: 'VE' },
    { code: '+52', label: '🇲🇽 México (+52)', country: 'MX' },
    { code: '+51', label: '🇵🇪 Perú (+51)', country: 'PE' },
    { code: '+598', label: '🇺🇾 Uruguay (+598)', country: 'UY' },
    { code: '+595', label: '🇵🇾 Paraguay (+595)', country: 'PY' },
    { code: '+591', label: '🇧🇴 Bolivia (+591)', country: 'BO' },
] as const;

// Keep old export name for backwards compatibility
export const MOBILE_AREA_CODES = COUNTRY_CODES;

interface MobileFieldProps {
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
    /** Pre-selected country code */
    countryCode?: string;
    /** @deprecated Use countryCode instead */
    areaCode?: string;
    /** Handler for country code changes */
    onCountryCodeChange?: (code: string) => void;
    /** @deprecated Use onCountryCodeChange instead */
    onAreaCodeChange?: (code: string) => void;
    /** Hide country code selector */
    hideCountryCode?: boolean;
    /** @deprecated Use hideCountryCode instead */
    hideAreaCode?: boolean;
}

// Format mobile: 1123456789 → 11 2345-6789
const formatMobile = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
};

// Remove formatting
const cleanMobile = (value: string): string => {
    return value.replace(/\D/g, '');
};

const MobileFieldComponent = forwardRef<HTMLInputElement, MobileFieldProps>(({
    label,
    placeholder = '11 2345-6789',
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
    countryCode = '+54',
    areaCode,
    onCountryCodeChange,
    onAreaCodeChange,
    hideCountryCode = false,
    hideAreaCode,
}, ref) => {
    // Support deprecated props
    const initialCode = areaCode || countryCode;
    const hideSelector = hideAreaCode ?? hideCountryCode;
    const handleCodeChange = onAreaCodeChange || onCountryCodeChange;

    const [selectedCode, setSelectedCode] = useState(initialCode);
    const [displayValue, setDisplayValue] = useState(() => {
        const initial = value || defaultValue || '';
        return formatMobile(initial);
    });

    const handleCountryChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setSelectedCode(newCode);
        handleCodeChange?.(newCode);
    }, [handleCodeChange]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleaned = cleanMobile(rawValue);

        // Limit to 10 digits (Argentine mobile without country code)
        if (cleaned.length > 10) return;

        setDisplayValue(formatMobile(cleaned));

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

    const currentValue = value !== undefined
        ? formatMobile(value)
        : displayValue;

    return (
        <Field.Root invalid={!!error} width="100%">
            {label && (
                <Field.Label fontSize="sm" fontWeight="medium">
                    {label}
                    {required && <span style={{ marginLeft: '4px', color: 'var(--chakra-colors-red-500)' }}>*</span>}
                </Field.Label>
            )}
            <HStack gap="2" width="100%">
                {!hideSelector && (
                    <NativeSelect.Root size={size} width="100px" flexShrink={0}>
                        <NativeSelect.Field
                            value={selectedCode}
                            onChange={handleCountryChange}
                        >
                            {COUNTRY_CODES.map((cc) => (
                                <option key={cc.code} value={cc.code}>
                                    {cc.code}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                )}
                <HStack flex="1" gap="2" align="center" width="100%">
                    <DevicePhoneMobileIcon style={{ width: '18px', height: '18px', color: 'var(--chakra-colors-gray-400)', flexShrink: 0 }} />
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
                        flex="1"
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

MobileFieldComponent.displayName = 'MobileField';

export const MobileField = memo(MobileFieldComponent);
