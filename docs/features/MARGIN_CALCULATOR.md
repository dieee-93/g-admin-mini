# Margin Calculator - Implementation Guide

**Status**: ✅ Implemented (2025-01-13)  
**Version**: 1.0.0  
**Category**: Educational Tools

---

## 📚 Purpose

Educational calculator to help users understand the **critical difference** between **Markup** and **Margin**.

### ⚠️ Why This Matters

**Markup and Margin are NOT the same**, but frequently confused:

| Metric | Formula | Example (Cost $100) |
|--------|---------|---------------------|
| **Markup** | `(Selling Price - Cost) / Cost × 100` | 50% markup = $150 price |
| **Margin** | `(Selling Price - Cost) / Selling Price × 100` | 50% margin = $200 price |

**Common Error**: Treating 50% markup as 50% margin → **underpricing by 25%** → **lost revenue**.

**Example**:
- Product costs $100
- Owner wants "50% profit"
- If they apply 50% **markup**: Price = $150 (actual margin = 33.33%) ❌
- If they apply 50% **margin**: Price = $200 (actual markup = 100%) ✅

---

## 🎯 Features

### 1. **Bidirectional Conversion**
- Enter Markup → Auto-calculate Margin and Price
- Enter Margin → Auto-calculate Markup and Price
- Real-time updates with DecimalUtils precision

### 2. **Educational UI**
- Color-coded active input
- Industry margin targets (Software, Food Service, Retail)
- Examples: "50% markup = 33.33% margin"
- Visual formulas and explanations

### 3. **Validation**
- Margin cannot be >= 100% (would result in infinite markup)
- Cost must be positive
- All calculations use financial precision (2 decimals)

---

## 🔧 Implementation Details

### Files Created/Modified

1. **DecimalUtils Enhancement**: `src/lib/decimal/decimalUtils.ts`
   - Added 3 new methods:
     - `convertMarkupToMargin(markupPercentage)`
     - `convertMarginToMarkup(marginPercentage)`
     - `calculatePriceFromMargin(cost, marginPercentage)`

2. **Calculator Component**: `src/components/calculators/MarginCalculator.tsx`
   - Standalone component (can be embedded anywhere)
   - Local state management (no Zustand needed)
   - Uses Field.Root from Chakra UI v3

3. **Dashboard Widget**: `src/modules/dashboard/widgets/MarginCalculatorWidget.tsx`
   - Wrapper for dashboard injection
   - Registered with priority 45 (educational)

4. **Dashboard Registration**: `src/modules/dashboard/manifest.tsx`
   - Added to `dashboard.widgets` hook
   - 8 total widgets now (was 7)

### Conversion Formulas (Implemented)

**Markup to Margin**:
```typescript
margin = markup / (1 + markup)

// Example: 50% markup
markup_decimal = 0.5
margin_decimal = 0.5 / (1 + 0.5) = 0.5 / 1.5 = 0.3333
margin_percentage = 33.33%
```

**Margin to Markup**:
```typescript
markup = margin / (1 - margin)

// Example: 33.33% margin
margin_decimal = 0.3333
markup_decimal = 0.3333 / (1 - 0.3333) = 0.3333 / 0.6667 = 0.5
markup_percentage = 50%
```

**Price from Margin**:
```typescript
price = cost / (1 - margin)

// Example: Cost $100, Margin 30%
margin_decimal = 0.3
price = 100 / (1 - 0.3) = 100 / 0.7 = $142.86
```

---

## 📊 Industry Targets (Displayed in UI)

| Industry | Typical Margin |
|----------|----------------|
| **Software** | 75-85% |
| **Food Service** | 60-70% |
| **Professional Services** | 50-70% |
| **Retail** | 20-55% |
| **Manufacturing** | 20-40% |

Source: `docs/teoria-administrativa/MATRIZ-CONCEPTOS-INDUSTRIAS.md`

---

## 🚀 Usage

### For Developers

```typescript
import { DecimalUtils } from '@/lib/decimal/decimalUtils';

// Convert 50% markup to margin
const marginDec = DecimalUtils.convertMarkupToMargin(50);
console.log(marginDec.toNumber()); // 33.33

// Convert 33.33% margin to markup
const markupDec = DecimalUtils.convertMarginToMarkup(33.33);
console.log(markupDec.toNumber()); // 50

// Calculate price from cost and desired margin
const priceDec = DecimalUtils.calculatePriceFromMargin(100, 30);
console.log(priceDec.toNumber()); // 142.86
```

### For Users

1. Navigate to **Dashboard**
2. Scroll to **Margin Calculator** widget
3. Enter **Cost** (e.g., $100)
4. Enter either:
   - **Markup %** (e.g., 50%) → Margin auto-calculated
   - **Margin %** (e.g., 33.33%) → Markup auto-calculated
5. View results: **Price**, **Profit**, **Both percentages**

---

## ✅ Testing

### Manual Tests

1. **Markup 50% = Margin 33.33%**
   - Cost: $100
   - Markup: 50%
   - Expected: Margin 33.33%, Price $150, Profit $50 ✅

2. **Markup 100% = Margin 50%**
   - Cost: $100
   - Markup: 100%
   - Expected: Margin 50%, Price $200, Profit $100 ✅

3. **Margin 30% = Markup 42.86%**
   - Cost: $100
   - Margin: 30%
   - Expected: Markup 42.86%, Price $142.86, Profit $42.86 ✅

4. **Edge Case: Margin 100%**
   - Cost: $100
   - Margin: 100%
   - Expected: Error "Margin no puede ser >= 100%" ✅

---

## 📖 Quick Reference

### Common Markup → Margin Conversions

| Markup % | Margin % |
|----------|----------|
| 10% | 9.09% |
| 25% | 20% |
| 50% | 33.33% |
| 75% | 42.86% |
| 100% | 50% |
| 150% | 60% |
| 200% | 66.67% |

---

## 🔗 References

- **Administrative Theory**: `docs/teoria-administrativa/02-MARGENES-Y-PRICING.md`
- **Industry Matrix**: `docs/teoria-administrativa/MATRIZ-CONCEPTOS-INDUSTRIAS.md`
- **DecimalUtils Source**: `src/lib/decimal/decimalUtils.ts` (lines 360-450)
- **Component Source**: `src/components/calculators/MarginCalculator.tsx`

---

## 🎓 Next Steps (Recommended)

1. **Break-Even Calculator** (CVP Analysis)
2. **Food Cost % Dashboard** (Real-time tracking)
3. **Prime Cost Calculator** (Food + Labor)
4. **Utilization Rate Calculator** (Professional Services)

---

**Last Updated**: 2025-01-13  
**Author**: OpenCode AI Assistant  
**Status**: ✅ Production Ready
