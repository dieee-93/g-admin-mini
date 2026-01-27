import { z } from 'zod';

/**
 * Brand entity interface
 */
export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating/editing brands
 */
export interface BrandFormData {
  name: string;
  logo_url: string;
  is_active: boolean;
}

/**
 * Zod schema for brand validation
 */
export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform((val) => val.toUpperCase().trim()),
  logo_url: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true; // Empty is valid
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'URL inválida (debe incluir http:// o https://)' }
    )
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type BrandSchemaType = z.infer<typeof brandSchema>;
