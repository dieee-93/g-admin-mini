# Plan de Implementación - Opción B: sale_payments como Single Source of Truth

**Fecha**: 2025-12-29
**Objetivo**: Migrar de arquitectura actual a Opción B recomendada
**Basado en**: RESEARCH_PAYMENT_ARCHITECTURE_INDUSTRY_STANDARDS.md

---

## 🎯 Overview

Migrar a una arquitectura donde `sale_payments` es el **Single Source of Truth** para todos los pagos, con denormalización estratégica en `cash_sessions` y `operational_shifts` para performance.

---

## 📋 Fases de Implementación

### ✅ PHASE 1: Database Schema Changes
**Objetivo**: Actualizar schema de `sale_payments` y eliminar redundancias

**Tareas**:
1. ✅ Crear migration para agregar nuevos campos a `sale_payments`
2. ✅ Crear enum `payment_status` para state machine
3. ✅ Agregar columnas denormalizadas a `cash_sessions` y `operational_shifts`
4. ✅ Crear índices para performance
5. ⚠️ Eliminar tabla `shift_payments` (después de migrar data)

**Archivos**:
- `database/migrations/20251229_improve_sale_payments_schema.sql`

---

### ✅ PHASE 2: Database Triggers
**Objetivo**: Crear triggers para mantener denormalización automática

**Tareas**:
1. ✅ Trigger: `sync_cash_session_totals()` - Actualiza cash_sessions
2. ✅ Trigger: `sync_shift_payment_totals()` - Actualiza operational_shifts
3. ✅ Trigger: `validate_payment_status_transition()` - Valida state machine
4. ✅ Trigger: `update_updated_at_column()` - Auto-update timestamps

**Archivos**:
- `database/migrations/20251229_create_payment_triggers.sql`

---

### 🔄 PHASE 3: TypeScript Types Update
**Objetivo**: Actualizar types para reflejar nuevo schema

**Tareas**:
1. ⏳ Regenerar types de Supabase: `pnpm run generate:types`
2. ⏳ Crear enum `PaymentStatus` en TypeScript
3. ⏳ Actualizar interface `SalePayment` con nuevos campos
4. ⏳ Crear types para `PaymentMetadata` por cada payment type

**Archivos**:
- `src/lib/supabase/database.types.ts` (auto-generado)
- `src/modules/cash/types/payment.ts` (nuevo)

---

### 🔄 PHASE 4: Services & Handlers Update
**Objetivo**: Actualizar lógica de negocio para usar nueva arquitectura

**Tareas**:
1. ⏳ Actualizar `salesPaymentHandler.ts` - Implementar idempotencia
2. ⏳ Crear `paymentStateManager.ts` - Gestionar state transitions
3. ⏳ Actualizar `cashSessionService.ts` - Usar cache denormalizado
4. ⏳ Crear `refundHandler.ts` - Manejar refunds con linked transactions
5. ⏳ Eliminar lógica de `shift_payments`

**Archivos**:
- `src/modules/cash/handlers/salesPaymentHandler.ts`
- `src/modules/cash/handlers/paymentStateManager.ts` (nuevo)
- `src/modules/cash/handlers/refundHandler.ts` (nuevo)
- `src/modules/cash/services/cashSessionService.ts`

---

### 🔄 PHASE 5: Migration Scripts
**Objetivo**: Migrar data existente a nueva estructura

**Tareas**:
1. ⏳ Script para migrar `shift_payments` → `sale_payments` (si hay data)
2. ⏳ Script para calcular y poblar `idempotency_key` para payments existentes
3. ⏳ Script para recalcular caches denormalizados desde source of truth
4. ⏳ Validación de integridad de data migrada

**Archivos**:
- `scripts/migrations/migrate-shift-payments.ts` (nuevo)
- `scripts/migrations/recalculate-payment-caches.ts` (nuevo)

---

### 🧪 PHASE 6: Testing
**Objetivo**: Validar que nueva arquitectura funciona correctamente

**Tareas**:
1. ⏳ Unit tests para payment state machine
2. ⏳ Integration tests para payment flows (CASH, CARD, TRANSFER, QR)
3. ⏳ Tests para idempotencia (retry scenarios)
4. ⏳ Tests para refunds y chargebacks
5. ⏳ Tests de reconciliación de cash sessions
6. ⏳ Tests de denormalización (triggers)

**Archivos**:
- `src/modules/cash/__tests__/payment-state-machine.test.ts` (nuevo)
- `src/modules/cash/__tests__/payment-flows.test.ts` (nuevo)
- `src/modules/cash/__tests__/idempotency.test.ts` (nuevo)
- `src/modules/cash/__tests__/refunds.test.ts` (nuevo)

---

### 📚 PHASE 7: Documentation
**Objetivo**: Documentar nueva arquitectura para el equipo

**Tareas**:
1. ⏳ Actualizar README de módulo cash
2. ⏳ Documentar payment flow diagrams
3. ⏳ Documentar API de payment handlers
4. ⏳ Crear guía de troubleshooting

**Archivos**:
- `docs/cash/PAYMENT_FLOWS.md` (nuevo)
- `docs/cash/API_REFERENCE.md` (nuevo)
- `docs/cash/TROUBLESHOOTING.md` (nuevo)

---

## 🗓️ Timeline Estimado

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: DB Schema | 2-3 horas | Ninguna |
| Phase 2: Triggers | 2-3 horas | Phase 1 |
| Phase 3: Types | 1 hora | Phase 1 |
| Phase 4: Services | 4-6 horas | Phase 2, 3 |
| Phase 5: Migration Scripts | 2-3 horas | Phase 1, 2 |
| Phase 6: Testing | 3-4 horas | Phase 4 |
| Phase 7: Documentation | 2 horas | Phase 4 |

**Total Estimado**: 16-22 horas de desarrollo

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Data Loss durante migración
**Mitigación**:
- ✅ Backup completo de DB antes de migration
- ✅ Ejecutar migrations en transaction
- ✅ Validar data migrada antes de drop tables

### Riesgo 2: Performance degradation con triggers
**Mitigación**:
- ✅ Índices optimizados en sale_payments
- ✅ Triggers eficientes (solo UPDATE necesarios)
- ✅ Monitorear performance post-deployment

### Riesgo 3: Breaking changes en código existente
**Mitigación**:
- ✅ Mantener backward compatibility temporal
- ✅ Feature flag para nueva lógica
- ✅ Testing exhaustivo antes de deploy

### Riesgo 4: Inconsistencia entre cache y source of truth
**Mitigación**:
- ✅ Triggers garantizan consistencia
- ✅ Script de recálculo manual disponible
- ✅ Validación periódica automática

---

## 🚀 Deployment Strategy

### Development
1. Ejecutar migrations en DB de desarrollo
2. Testing local completo
3. Code review con equipo

### Staging
1. Backup de DB staging
2. Ejecutar migrations
3. Ejecutar migration scripts
4. Testing completo en staging
5. Validar performance

### Production
1. **Backup completo de DB production**
2. Programar maintenance window
3. Ejecutar migrations (en transaction)
4. Ejecutar migration scripts
5. Validar data integrity
6. Monitorear performance
7. Rollback plan ready

---

## 📊 Success Criteria

- ✅ Todas las migrations ejecutadas sin errores
- ✅ Todos los tests pasan (100% coverage en nuevos handlers)
- ✅ Zero data loss
- ✅ Performance igual o mejor que antes
- ✅ Caches denormalizados consistentes con source of truth
- ✅ Idempotencia funcionando (no duplicados)
- ✅ State machine validado
- ✅ Documentación completa

---

## 🔄 Rollback Plan

Si algo sale mal durante deployment:

### Rollback de Migrations
```sql
-- Restore desde backup
pg_restore -d database_name backup_file.dump

-- O manual rollback de cada migration
-- (cada migration incluirá sección de rollback)
```

### Rollback de Código
```bash
git revert <commit-hash>
git push origin main
```

### Validación Post-Rollback
- Verificar que sistema funciona normalmente
- Verificar data integrity
- Notificar a equipo

---

## 📝 Checklist Pre-Deployment

Antes de ejecutar en production:

- [ ] DB backup completo realizado
- [ ] Migrations probadas en staging
- [ ] Todos los tests pasan
- [ ] Performance validado en staging
- [ ] Equipo notificado de maintenance window
- [ ] Rollback plan documentado y practicado
- [ ] Monitoring configurado
- [ ] Documentación actualizada

---

## 🎯 Next Steps

1. **Ahora**: Crear migrations SQL (Phase 1 & 2)
2. **Siguiente**: Regenerar types y actualizar código (Phase 3 & 4)
3. **Después**: Testing exhaustivo (Phase 6)
4. **Finalmente**: Deploy a staging → production

---

**Documento creado**: 2025-12-29
**Status**: 🟢 Ready to implement
**Owner**: Dev Team
