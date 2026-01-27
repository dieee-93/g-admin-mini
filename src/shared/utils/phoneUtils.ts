/**
 * Phone Utilities - Helper functions for phone handling
 * 
 * Use these in lists, displays, and other non-input contexts.
 */

/**
 * Get WhatsApp link for an Argentine mobile number
 * @param areaCode - Area code without leading 0 (e.g., "11", "351")
 * @param number - Phone number without area code (e.g., "12345678")
 * @returns WhatsApp URL or null if invalid
 */
export function getWhatsAppLink(areaCode: string, number: string): string | null {
    const cleanArea = areaCode.replace(/\D/g, '');
    const cleanNumber = number.replace(/\D/g, '');

    if (!cleanArea || !cleanNumber) return null;
    if (cleanNumber.length < 6 || cleanNumber.length > 8) return null;

    // Format: +549 + area code + number (without 15)
    return `https://wa.me/549${cleanArea}${cleanNumber}`;
}

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @param areaCode - Area code (optional, for full display)
 * @returns Formatted phone string
 */
export function formatPhoneDisplay(phone: string, areaCode?: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) return '-';

    // Format as XXXX-XXXX
    const formatted = cleaned.length > 4
        ? `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
        : cleaned;

    if (areaCode) {
        return `(${areaCode}) ${formatted}`;
    }

    return formatted;
}

/**
 * Format mobile number for display with 15 prefix
 */
export function formatMobileDisplay(phone: string, areaCode?: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) return '-';

    const formatted = cleaned.length > 4
        ? `15 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
        : `15 ${cleaned}`;

    if (areaCode) {
        return `(${areaCode}) ${formatted}`;
    }

    return formatted;
}

/**
 * Check if a phone number appears to be a mobile number
 * (Simple heuristic based on common patterns)
 */
export function isMobileNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Argentine mobile numbers typically have 15 prefix or start with certain digits
    return cleaned.startsWith('15') || cleaned.length === 8;
}

/**
 * Format DNI for display with dots
 */
export function formatDNIDisplay(dni: string): string {
    const cleaned = dni.replace(/\D/g, '');

    if (!cleaned) return '-';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, -3)}.${cleaned.slice(-3)}`;

    return `${cleaned.slice(0, -6)}.${cleaned.slice(-6, -3)}.${cleaned.slice(-3)}`;
}
