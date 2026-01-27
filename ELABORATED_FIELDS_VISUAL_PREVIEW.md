# 🎨 ElaboratedFields Visual Preview

## Component Layout Visualization

```
╔════════════════════════════════════════════════════════════════════════╗
║                     ELABORATED MATERIAL FORM                           ║
╚════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  🟢 MATERIAL ELABORADO                         REQUIERE RECETA        │
│  ↑ LED pulsante verde                          ↑ Badge azul sólido    │
│  ↑ Typography industrial                                              │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘


┌═══════════════════════════════════════════════════════════════════════┐
║                                                                        ║
║  CATEGORÍA DE NEGOCIO                                           🟢    ║
║  ↑ Label uppercase, wide tracking                              ↑ LED  ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────┐    ║
║  │  Selecciona categoría del material...                    ▼  │    ║
║  │  ↑ SelectField con monospace                                │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                        ║
╚═══════════════════════════════════════════════════════════════════════╝
 ║ ↑ Left accent bar (4px) - Verde cuando activo, gris si no
 ↑ Border 3px grueso


┌───────────────────────────────────────────────────────────────────────┐
│ ║                                                                      │
│ ║ 🟠 INFORMACIÓN IMPORTANTE                                           │
│ ║ ↑ LED pulsante naranja                                              │
│ ║                                                                      │
│ ║  ▸ Requiere receta con ingredientes y cantidades                    │
│ ║  ▸ Se ejecuta automáticamente al guardar el material               │
│ ║  ▸ Genera el stock inicial del material elaborado                  │
│ ║                                                                      │
└───────────────────────────────────────────────────────────────────────┘
  ║ ↑ Gradient naranja en left bar
  ↑ Border 2px con colorPalette orange


━━━━━━━━━━━━━━━━━━━━ CONSTRUCTOR DE RECETA ━━━━━━━━━━━━━━━━━━━━━━
↑ SectionDivider con líneas gruesas


╔═══════════════════════════════════════════════════════════════════════╗
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ GRADIENT AZUL ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
║ ↑ Pseudo-element ::before con 4px gradient top                        ║
║                                                                        ║
║  🟢 MÓDULO DE PRODUCCIÓN ACTIVO                                      ║
║  ────────────────────────────────────────────────────────────────     ║
║  ↑ Production status con border-bottom subtle                         ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────┐    ║
║  │                                                               │    ║
║  │              RECIPEBUILDER COMPONENT                          │    ║
║  │                                                               │    ║
║  │  • BasicInfoSection                                           │    ║
║  │  • InputsEditorSection                                        │    ║
║  │  • RecipeProductionSection                                    │    ║
║  │  • CostSummarySection (lazy)                                  │    ║
║  │  • InstructionsSection (lazy)                                 │    ║
║  │                                                               │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                        ║
╚═══════════════════════════════════════════════════════════════════════╝
↑ Border 3px, bg subtle, box-shadow lg, hover enhances shadow
```

---

## Color Palette Breakdown

### Status LEDs

```
🟢 ACTIVE (Green)
  - colorPalette: green
  - Uses: Active states, production running, category selected
  - Animation: 2s pulse with glow
  - Box-shadow: 0 0 8px emphasized, 0 0 16px subtle

🟠 WARNING (Orange)
  - colorPalette: orange
  - Uses: Important information, alerts
  - Animation: 1.5s faster pulse
  - Subtle opacity animation

⚪ INACTIVE (Gray)
  - colorPalette: gray
  - Uses: Inactive states, not selected
  - No animation
  - Static shadow
```

### Container Color Schemes

```
CATEGORY PANEL (Dynamic)
  - When empty:     colorPalette="gray"
  - When selected:  colorPalette="green"
  - Left bar:       4px accent (solid)
  - Background:     bg.panel
  - Border:         border.emphasized (3px)

WARNING PANEL (Orange)
  - colorPalette:   orange
  - Left bar:       Vertical gradient (solid → emphasized)
  - Background:     bg.panel
  - Border:         emphasized (2px)

PRODUCTION MODULE (Blue)
  - colorPalette:   blue
  - Top bar:        Horizontal gradient (emphasized → fg)
  - Background:     bg.subtle
  - Border:         border.emphasized (3px)
```

---

## Typography Scale

```
SECTION LABELS (Industrial Headers)
  fontSize:      xs
  fontWeight:    800
  letterSpacing: widest
  textTransform: uppercase
  color:         fg.muted

CONTAINER TITLES
  fontSize:      2xs
  fontWeight:    700
  letterSpacing: wider
  textTransform: uppercase
  color:         fg.muted

BODY TEXT
  fontSize:      2xs
  color:         fg.muted
  lineHeight:    relaxed

BADGE TEXT
  fontSize:      2xs
  fontWeight:    800
  letterSpacing: wide
  textTransform: uppercase

MONOSPACE (Select values)
  fontFamily:    var(--chakra-fonts-mono)
  fontSize:      sm
  fontWeight:    600
```

---

## Spacing & Layout

```
Component Gap:     gap="6" (24px between sections)

Panel Padding:     p="5" (20px internal padding)

LED Sizes:
  - sm:  6px
  - md:  8px
  - lg:  10px

Border Widths:
  - Standard:     3px
  - Accent bar:   4px
  - Alert panel:  2px
  - Gradient:     4px

Border Radius:
  - Containers:   xl (12px)
  - Alerts:       lg (8px)
  - LEDs:         full (circular)

Shadows:
  - Default:      lg
  - Hover:        xl
  - Alert:        md
  - LED:          custom glow
```

---

## Micro-Interactions

### Container Hover

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

_hover: {
  transform: translateY(-1px)
  boxShadow: xl
  borderColor: border.default
}
```

**Effect:** Subtle lift with enhanced shadow depth

---

### LED Pulse Animation

```css
@keyframes pulse-led {
  0%, 100%: { opacity: 1, transform: scale(1) }
  50%:      { opacity: 0.7, transform: scale(0.95) }
}

duration: 2s
easing: cubic-bezier(0.4, 0, 0.6, 1)
iteration: infinite
```

**Effect:** Smooth breathing effect like physical LED

---

### Warning Pulse

```css
@keyframes pulse-warning {
  0%, 100%: { opacity: 1 }
  50%:      { opacity: 0.5 }
}

duration: 1.5s (faster than LED)
easing: cubic-bezier(0.4, 0, 0.6, 1)
iteration: infinite
```

**Effect:** Faster pulsing for urgency

---

## State Variations

### Category Panel States

```
╔═══════════════════════════════════════════╗
║ EMPTY STATE (Gray)                        ║
║  CATEGORÍA DE NEGOCIO               ⚪   ║
║  [Selecciona categoría...        ▼]      ║
╚═══════════════════════════════════════════╝
 ║ ← gray left bar (muted)


╔═══════════════════════════════════════════╗
║ SELECTED STATE (Green)                    ║
║  CATEGORÍA DE NEGOCIO               🟢   ║
║  [🥛 Lácteos                      ▼]     ║
╚═══════════════════════════════════════════╝
 ║ ← green left bar (solid), pulsing LED
```

---

## Responsive Behavior

### Desktop (> 768px)
- Full layout with generous spacing (gap="6")
- All containers at full width
- Hover interactions enabled
- All animations active

### Mobile (< 768px)
- Reduced spacing (gap="4")
- Compact padding (p="4" instead of p="5")
- Simplified shadows (md instead of lg)
- Touch-optimized hit areas
- Reduced animation intensity

---

## Accessibility Features

### Color Blindness Safe
- Never relies on color alone for meaning
- Status communicated via:
  - LED position
  - Text labels
  - Icon indicators
  - Border variations

### Keyboard Navigation
- All interactive elements focusable
- Clear focus states with outlines
- Logical tab order

### Screen Readers
- Semantic HTML structure
- ARIA labels on status indicators
- Clear heading hierarchy
- Descriptive error messages

---

## Performance Characteristics

### React.memo Usage
```tsx
StatusIndicator      → memo ✅
IndustrialContainer  → memo ✅
SectionDivider       → memo ✅
ElaboratedFields     → memo ✅
```

### Render Triggers
- Component only re-renders when:
  - `formData.name` changes
  - `formData.unit` changes
  - `formData.category` changes
  - Parent forces update

### Animation Performance
- All animations use CSS only (GPU-accelerated)
- No JavaScript-driven animations
- Transform and opacity only (no layout changes)
- Will-change hints for smoother performance

---

## Browser Compatibility

### Fully Supported
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

### Features Used
- CSS Custom Properties (variables) ✅
- CSS Grid/Flexbox ✅
- CSS Animations ✅
- Pseudo-elements (::before, ::after) ✅
- CSS calc() ✅

---

## Theme Compatibility

### Light Mode
```
bg.panel:           white / light gray
bg.subtle:          very light gray
border.emphasized:  medium gray
fg.muted:           dark gray
```

### Dark Mode
```
bg.panel:           dark gray / near-black
bg.subtle:          darker gray
border.emphasized:  light gray
fg.muted:           light gray
```

**All colors automatically adapt via semantic tokens!**

---

## Usage Example in Context

```tsx
// Parent Component: MaterialFormModal
function MaterialFormModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    type: 'ELABORATED',
    unit: 'unit',
    category: '',
    initial_stock: 1
  });

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Material Elaborado</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ElaboratedFields
            formData={formData}
            setFormData={setFormData}
          />
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button colorPalette="blue" onClick={handleSave}>
            Guardar Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Future Enhancement Opportunities

### Potential Additions
- [ ] Real-time validation indicators
- [ ] Progress tracker for recipe completion
- [ ] Estimated production time calculation
- [ ] Material cost preview
- [ ] Ingredient availability check
- [ ] Production schedule integration

### Animation Enhancements
- [ ] Staggered reveal on mount
- [ ] Success celebration on save
- [ ] Error shake animation
- [ ] Loading skeleton states

### UX Improvements
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Autosave draft
- [ ] Duplicate detection
- [ ] Smart suggestions based on category

---

**Design System:** G-Admin Mini v3.23.0
**Component Version:** 1.0.0 - Industrial Precision
**Last Updated:** 2026-01-10
