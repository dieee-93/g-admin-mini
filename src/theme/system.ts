import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', sans-serif` },
        body: { value: `'Inter', sans-serif` },
      },
      colors: {
        brand: {
          50: { value: "#e6f3ff" },
          100: { value: "#b3daff" },
          200: { value: "#80c1ff" },
          300: { value: "#4da8ff" },
          400: { value: "#1a8fff" },
          500: { value: "#0070f3" },
          600: { value: "#005cc5" },
          700: { value: "#004497" },
          800: { value: "#002c69" },
          900: { value: "#00143b" },
        },
      },
    },
    // ✅ Configuraciones específicas del proyecto
    breakpoints: {
      sm: "320px",
      md: "768px", 
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  globalCss: {
    // ✅ Estilos globales para g-admin-mini
    body: {
      bg: "gray.50",
      color: "gray.900",
    },
    // ✅ Scroll suave en toda la aplicación
    html: {
      scrollBehavior: "smooth",
    },
  },
})

export const system = createSystem(defaultConfig, config)