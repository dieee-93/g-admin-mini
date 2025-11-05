/**
 * Image Component - ChakraUI v3 Wrapper
 *
 * @description
 * Displays images with responsive sizing and object-fit control.
 *
 * @chakraui-version v3.23.0
 * @docs https://www.chakra-ui.com/docs/components/image
 *
 * @props
 * - `fit` - object-fit CSS property (cover, contain, fill, etc.)
 * - `align` - object-position CSS property
 * - `src` - Image source URL
 * - `alt` - Alternative text (required for accessibility)
 * - `loading` - Lazy loading ("lazy" | "eager")
 * - Plus all Chakra style props (width, height, rounded, etc.)
 *
 * @example
 * // Basic usage
 * <Image src="https://bit.ly/dan-abramov" alt="Profile" rounded="md" />
 *
 * @example
 * // Circular avatar with object-fit
 * <Image
 *   src="https://bit.ly/naruto-sage"
 *   boxSize="150px"
 *   borderRadius="full"
 *   fit="cover"
 *   alt="Avatar"
 * />
 *
 * @example
 * // With aspect ratio (4:3)
 * <Image
 *   src="/product.jpg"
 *   alt="Product"
 *   aspectRatio={4 / 3}
 *   width="300px"
 * />
 *
 * @example
 * // Contained within fixed dimensions
 * <Image
 *   h="200px"
 *   w="300px"
 *   fit="contain"
 *   src="/logo.png"
 *   alt="Company logo"
 * />
 *
 * @example
 * // With fallback for missing images
 * <Image
 *   src={product.imageUrl}
 *   alt={product.name}
 *   fallback={<Box bg="gray.100" h="200px" w="200px" />}
 * />
 */
import { Image as ChakraImage } from '@chakra-ui/react';

export const Image = ChakraImage;
export type { ImageProps } from '@chakra-ui/react';
