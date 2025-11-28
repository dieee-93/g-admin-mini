# 3️⃣ ASSET CONFIG SECTION

**Part of**: PRODUCTS_FORM_DIGITAL_SECTIONS_SPEC.md
**Date**: 2025-01-10

### Metadata
**Visibilidad**: Solo para `rental` (SIEMPRE aparece)
**Orden**: SEGUNDO (después de Basic Info, antes de Pricing)
**Propósito**: Configurar el activo específico que se alquilará y su gestión

### Research Insights

Basado en análisis de **RentalMan**, **EZRentOut**, **Quipli**, **DAMAGE iD**, y **best practices 2025**:

**Patrones comunes identificados**:
1. ✅ Asset tracking con barcodes/serial numbers
2. ✅ Pre/post-rental inspections digitales
3. ✅ AI-powered damage detection (DeGould 4.0)
4. ✅ Interactive vehicle diagrams para pinpoint damages
5. ✅ Depreciation tracking (12+ methods - Fame Rental)
6. ✅ Preventive maintenance scheduling
7. ✅ GPS tracking para high-value assets

**Trends 2025**:
- ✅ Mobile-first inspection apps
- ✅ Photo/video evidence con timestamps
- ✅ Blockchain para dispute resolution
- ✅ Predictive maintenance con IoT sensors

### Interface TypeScript

```typescript
interface AssetConfigFields {
  // Asset selection - CRITICAL DECISION
  // TODO: Integrar con Assets module cuando esté implementado
  asset_selection_mode: 'specific' | 'category' | 'any_available'

  // Si specific: Seleccionar asset exacto
  specific_asset_id?: string  // ID del asset en Assets table

  // Si category: Cualquier asset de esta categoría
  asset_category?: string  // ej: "sedan", "power_tool", "conference_room"

  // Asset details (read-only si viene de Assets module)
  asset_details?: {
    name: string
    serial_number?: string
    barcode?: string
    purchase_date?: Date
    purchase_price?: number
    current_value?: number  // Para calcular depreciación
  }

  // Depreciation tracking
  // NOTE: RentalMan ofrece 12+ métodos de depreciación
  depreciation_config: {
    method: 'straight_line' | 'declining_balance' | 'units_of_production' | 'none'
    useful_life_years?: number  // Para straight_line
    salvage_value?: number  // Valor residual estimado
    depreciation_rate?: number  // % anual para declining_balance
    total_units?: number  // Para units_of_production (ej: kms, horas)
  }

  // Condition tracking & Inspection
  // CRITICAL: Digital inspections previenen disputas (DAMAGE iD)
  condition_tracking: {
    require_pre_rental_inspection: boolean
    require_post_rental_inspection: boolean
    inspection_type: 'checklist' | 'photo_video' | 'ai_powered' | 'interactive_diagram'

    // Pre-defined checklist
    inspection_checklist?: InspectionItem[]

    // Damage documentation
    allow_damage_photos: boolean
    require_damage_photos: boolean  // Si hay daño detectado
    use_interactive_diagram: boolean  // Pinpoint exact location
  }

  // Security deposit
  // NOTE: Común en rentals para cubrir daños potenciales
  security_deposit: {
    required: boolean
    amount?: number  // Monto fijo
    percentage_of_rental?: number  // % del precio de alquiler
    refundable: boolean
    hold_duration_days?: number  // Días después de devolución
  }

  // Insurance & Liability
  insurance_config?: {
    insurance_required: boolean
    insurance_provider?: 'self' | 'third_party' | 'customer'
    insurance_cost_per_day?: number  // Si lo provee el negocio
    liability_waiver_required: boolean
    max_liability_coverage?: number
  }

  // Maintenance tracking
  // TODO: Integrar con maintenance schedule system
  maintenance_config: {
    track_usage: boolean  // Horas de uso, kilometraje, etc.
    usage_unit?: 'hours' | 'kilometers' | 'days' | 'cycles'
    maintenance_interval?: number  // Cada X unidades
    maintenance_interval_unit?: string
    last_maintenance_date?: Date
    next_maintenance_due?: Date | number  // Date o usage threshold
  }

  // Availability management
  // ⚠️ IMPORTANTE: Todas las duraciones se almacenan internamente en MINUTOS
  // UI puede mostrar en horas/días pero se convierte a minutos para storage
  availability_config: {
    min_rental_duration_minutes: number  // Duración mínima (en MINUTOS internamente)
    max_rental_duration_minutes?: number  // null = ilimitado
    buffer_time_minutes: number  // Tiempo entre rentas (limpieza, mantenimiento) en MINUTOS
    blackout_dates?: Date[]  // Fechas no disponibles
    seasonal_availability?: boolean  // ej: ski equipment solo invierno
  }

  // GPS/Tracking (para assets de alto valor)
  // NOTE: Común en car rentals, equipment costoso
  tracking_config?: {
    gps_enabled: boolean
    gps_device_id?: string
    geofence_enabled: boolean  // Alertas si sale de área permitida
    geofence_radius_km?: number
    tracking_interval_minutes?: number
  }

  // Usage restrictions
  usage_restrictions?: {
    requires_license: boolean  // ej: Auto, maquinaria pesada
    license_type?: string
    requires_certification: boolean
    certification_type?: string
    age_restriction?: number  // Edad mínima
    max_passengers?: number  // Para vehículos
    max_weight_kg?: number  // Para equipos
    allowed_terrain?: string[]  // ej: ["paved", "off-road"]
  }

  // Accessories & Add-ons
  // NOTE: Común ofrecer extras (GPS, child seat, insurance upgrade)
  accessories?: AssetAccessory[]
}

interface InspectionItem {
  id: string
  category: string  // ej: "exterior", "interior", "mechanical"
  item: string  // ej: "Front bumper", "Engine oil level"
  condition_options: ('excellent' | 'good' | 'fair' | 'poor' | 'damaged')[]
  requires_photo_if_damaged: boolean
  notes_required: boolean
}

interface AssetAccessory {
  id: string
  name: string
  description?: string
  price_per_day: number
  required: boolean  // Obligatorio o opcional
  stock_quantity?: number  // Para accesorios limitados
}
```

### Layout JSX Completo

```tsx
<FormSection title="Configuración de Activo">
  <Stack gap={4}>
    {/* Info box */}
    <Alert status="info" variant="subtle">
      <AlertIcon />
      <Box>
        <Text fontWeight="bold">Producto de alquiler</Text>
        <Text fontSize="sm">
          Configura el activo que se alquilará y cómo se gestionará
        </Text>
      </Box>
    </Alert>

    {/* ========== ASSET SELECTION MODE ========== */}
    <Field label="Modo de selección de activo" required>
      <RadioGroup
        value={formData.asset_selection_mode}
        onValueChange={(details) => handleChange('asset_selection_mode', details.value)}
      >
        <Stack gap={3}>
          <Card
            variant="outline"
            borderColor={formData.asset_selection_mode === 'specific' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="specific">
                <Stack gap={1}>
                  <Text fontWeight="bold">Activo Específico</Text>
                  <Text fontSize="sm" color="gray.600">
                    Alquilar un activo en particular (ej: "Tesla Model 3 - Placa ABC123")
                  </Text>
                </Stack>
              </Radio>

              {formData.asset_selection_mode === 'specific' && (
                <Stack gap={3} mt={3}>
                  {/* Asset selector */}
                  {/* TODO: Integrar con Assets module para listar assets disponibles */}
                  <Field label="Seleccionar activo" required>
                    <Button
                      variant="outline"
                      onClick={handleOpenAssetSelector}
                      width="full"
                      justifyContent="space-between"
                    >
                      {formData.specific_asset_id
                        ? formData.asset_details?.name
                        : 'Seleccionar activo...'}
                      <ChevronDownIcon />
                    </Button>
                  </Field>

                  {/* Asset details (read-only) */}
                  {formData.asset_details && (
                    <Card variant="outline" bg="gray.50">
                      <CardBody>
                        <Stack gap={2}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Serial:</Text>
                            <Text fontWeight="medium">{formData.asset_details.serial_number}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Valor actual:</Text>
                            <Text fontWeight="medium">${formData.asset_details.current_value}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Fecha de compra:</Text>
                            <Text fontWeight="medium">
                              {formatDate(formData.asset_details.purchase_date)}
                            </Text>
                          </HStack>
                        </Stack>
                      </CardBody>
                    </Card>
                  )}
                </Stack>
              )}
            </CardBody>
          </Card>

          <Card
            variant="outline"
            borderColor={formData.asset_selection_mode === 'category' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="category">
                <Stack gap={1}>
                  <Text fontWeight="bold">Categoría de Activo</Text>
                  <Text fontSize="sm" color="gray.600">
                    Cualquier activo de esta categoría (ej: "Cualquier auto sedan")
                  </Text>
                </Stack>
              </Radio>

              {formData.asset_selection_mode === 'category' && (
                <Field label="Categoría" required mt={3}>
                  <Input
                    placeholder='ej: "sedan", "power_drill", "conference_room"'
                    value={formData.asset_category ?? ''}
                    onChange={(e) => handleChange('asset_category', e.target.value)}
                  />
                  <HelperText>
                    Al reservar, se asignará cualquier activo disponible de esta categoría
                  </HelperText>
                </Field>
              )}
            </CardBody>
          </Card>

          <Card
            variant="outline"
            borderColor={formData.asset_selection_mode === 'any_available' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="any_available">
                <Stack gap={1}>
                  <Text fontWeight="bold">Cualquier Activo Disponible</Text>
                  <Text fontSize="sm" color="gray.600">
                    Asignar automáticamente cualquier activo libre al momento de reservar
                  </Text>
                </Stack>
              </Radio>
            </CardBody>
          </Card>
        </Stack>
      </RadioGroup>
    </Field>

    {/* ========== DEPRECIATION CONFIG ========== */}
    {/* NOTE: 12+ métodos disponibles en RentalMan - implementar más populares */}
    <Divider />

    <Stack gap={3}>
      <Heading size="sm">Depreciación del Activo</Heading>
      <Text fontSize="sm" color="gray.600">
        Define cómo se calcula la depreciación para pricing y contabilidad
      </Text>

      <Field label="Método de depreciación" required>
        <SelectField
          placeholder="Selecciona método"
          options={[
            {
              value: 'none',
              label: 'Sin depreciación',
              description: 'No trackear depreciación'
            },
            {
              value: 'straight_line',
              label: 'Línea Recta',
              description: 'Depreciación uniforme a lo largo de la vida útil'
            },
            {
              value: 'declining_balance',
              label: 'Saldo Decreciente',
              description: 'Depreciación mayor al inicio, menor al final'
            },
            {
              value: 'units_of_production',
              label: 'Unidades de Producción',
              description: 'Depreciación según uso (kms, horas, etc.)'
            }
          ]}
          value={formData.depreciation_config?.method}
          onValueChange={(details) => handleChange('depreciation_config.method', details.value[0])}
        />
      </Field>

      {formData.depreciation_config?.method === 'straight_line' && (
        <Grid columns={2} gap={3}>
          <Field label="Vida útil" required>
            <InputGroup>
              <Input
                type="number"
                min="1"
                placeholder="5"
                value={formData.depreciation_config.useful_life_years ?? ''}
                onChange={(e) => handleChange('depreciation_config.useful_life_years',
                  parseInt(e.target.value)
                )}
              />
              <InputRightAddon>años</InputRightAddon>
            </InputGroup>
          </Field>

          <Field label="Valor residual">
            <InputGroup>
              <InputLeftAddon>$</InputLeftAddon>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="1000"
                value={formData.depreciation_config.salvage_value ?? ''}
                onChange={(e) => handleChange('depreciation_config.salvage_value',
                  e.target.value ? parseFloat(e.target.value) : null
                )}
              />
            </InputGroup>
            <HelperText>
              Valor estimado al final de la vida útil
            </HelperText>
          </Field>
        </Grid>
      )}

      {formData.depreciation_config?.method === 'declining_balance' && (
        <Field label="Tasa de depreciación anual" required>
          <InputGroup>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="20"
              value={formData.depreciation_config.depreciation_rate ?? ''}
              onChange={(e) => handleChange('depreciation_config.depreciation_rate',
                parseFloat(e.target.value)
              )}
            />
            <InputRightAddon>%</InputRightAddon>
          </InputGroup>
          <HelperText>
            Común: 20% (doble de línea recta para 5 años)
          </HelperText>
        </Field>
      )}

      {formData.depreciation_config?.method === 'units_of_production' && (
        <Field label="Total de unidades de vida útil" required>
          <InputGroup>
            <Input
              type="number"
              min="1"
              placeholder="100000"
              value={formData.depreciation_config.total_units ?? ''}
              onChange={(e) => handleChange('depreciation_config.total_units',
                parseInt(e.target.value)
              )}
            />
            <SelectField
              placeholder="Unidad"
              options={[
                { value: 'kilometers', label: 'kilómetros' },
                { value: 'hours', label: 'horas' },
                { value: 'cycles', label: 'ciclos' }
              ]}
              value={formData.maintenance_config?.usage_unit}
              onValueChange={(details) => handleChange('maintenance_config.usage_unit', details.value[0])}
            />
          </InputGroup>
          <HelperText>
            Ej: Auto con 100,000 km de vida útil estimada
          </HelperText>
        </Field>
      )}

      {/* Calculated depreciation per rental */}
      {formData.depreciation_config?.method !== 'none' && (
        <Alert status="info" variant="subtle">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">
              Costo de depreciación estimado: ${calculateDepreciationPerRental(formData)}
            </Text>
            <Text fontSize="sm">
              Este costo se considerará en el pricing del alquiler
            </Text>
          </Box>
        </Alert>
      )}
    </Stack>

    {/* ========== CONDITION TRACKING ========== */}
    {/* CRITICAL: Digital inspections reduce disputes by 90% (DAMAGE iD) */}
    <Divider />

    <Stack gap={3}>
      <Heading size="sm">Seguimiento de Condición</Heading>
      <Text fontSize="sm" color="gray.600">
        Inspecciones pre/post alquiler para documentar el estado del activo
      </Text>

      <Alert status="warning" variant="left-accent">
        <AlertIcon />
        <Text fontSize="sm">
          💡 <strong>Best practice:</strong> Inspecciones digitales reducen disputas por daños en 90%
          (DAMAGE iD benchmark)
        </Text>
      </Alert>

      <Field>
        <Switch
          checked={formData.condition_tracking?.require_pre_rental_inspection ?? true}
          onCheckedChange={(e) => handleChange('condition_tracking.require_pre_rental_inspection', e.checked)}
        >
          Requerir inspección pre-alquiler
        </Switch>
        <HelperText>
          Documentar el estado ANTES de entregar al cliente
        </HelperText>
      </Field>

      <Field>
        <Switch
          checked={formData.condition_tracking?.require_post_rental_inspection ?? true}
          onCheckedChange={(e) => handleChange('condition_tracking.require_post_rental_inspection', e.checked)}
        >
          Requerir inspección post-alquiler
        </Switch>
        <HelperText>
          Documentar el estado DESPUÉS de la devolución
        </HelperText>
      </Field>

      {(formData.condition_tracking?.require_pre_rental_inspection ||
        formData.condition_tracking?.require_post_rental_inspection) && (
        <Card variant="outline" bg="blue.50">
          <CardBody>
            <Stack gap={4}>
              <Field label="Tipo de inspección" required>
                <SelectField
                  placeholder="Selecciona tipo"
                  options={[
                    {
                      value: 'checklist',
                      label: 'Checklist Simple',
                      description: 'Lista de ítems a verificar (Bueno/Malo)'
                    },
                    {
                      value: 'photo_video',
                      label: 'Fotos/Videos',
                      description: 'Evidencia visual con timestamps'
                    },
                    {
                      value: 'interactive_diagram',
                      label: 'Diagrama Interactivo',
                      description: 'Pinpoint exact location de daños'
                    },
                    {
                      value: 'ai_powered',
                      label: 'AI-Powered (Futuro)',
                      description: 'Detección automática de daños con IA'
                    }
                  ]}
                  value={formData.condition_tracking.inspection_type}
                  onValueChange={(details) => handleChange('condition_tracking.inspection_type', details.value[0])}
                />
              </Field>

              {/* Checklist builder */}
              {formData.condition_tracking.inspection_type === 'checklist' && (
                <Stack gap={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Items del Checklist</Text>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="purple"
                      onClick={handleAddInspectionItem}
                    >
                      <PlusIcon />
                      Agregar Ítem
                    </Button>
                  </HStack>

                  {formData.condition_tracking.inspection_checklist?.length === 0 && (
                    <EmptyState
                      title="Sin ítems en el checklist"
                      description="Agrega ítems a verificar durante la inspección"
                      icon={<ChecklistIcon />}
                    />
                  )}

                  {formData.condition_tracking.inspection_checklist?.map((item, index) => (
                    <InspectionItemRow
                      key={item.id}
                      item={item}
                      onUpdate={(updated) => updateInspectionItem(index, updated)}
                      onRemove={() => removeInspectionItem(index)}
                    />
                  ))}

                  {/* Templates de checklist */}
                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.600">Templates:</Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => loadChecklistTemplate('vehicle')}
                    >
                      Vehículo
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => loadChecklistTemplate('equipment')}
                    >
                      Equipo
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => loadChecklistTemplate('space')}
                    >
                      Espacio
                    </Button>
                  </HStack>
                </Stack>
              )}

              {/* Photo/Video settings */}
              {formData.condition_tracking.inspection_type === 'photo_video' && (
                <Stack gap={2}>
                  <Field>
                    <Switch
                      checked={formData.condition_tracking.allow_damage_photos ?? true}
                      onCheckedChange={(e) => handleChange('condition_tracking.allow_damage_photos', e.checked)}
                    >
                      Permitir fotos/videos de daños
                    </Switch>
                  </Field>

                  <Field>
                    <Switch
                      checked={formData.condition_tracking.require_damage_photos ?? false}
                      onCheckedChange={(e) => handleChange('condition_tracking.require_damage_photos', e.checked)}
                    >
                      Requerir fotos si hay daño detectado
                    </Switch>
                  </Field>

                  <Alert status="info" variant="subtle">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Las fotos incluirán timestamp automático y GPS location
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Interactive diagram */}
              {formData.condition_tracking.inspection_type === 'interactive_diagram' && (
                <>
                  <Field>
                    <Switch
                      checked={formData.condition_tracking.use_interactive_diagram ?? true}
                      onCheckedChange={(e) => handleChange('condition_tracking.use_interactive_diagram', e.checked)}
                      disabled={true}
                    >
                      Usar diagrama interactivo
                    </Switch>
                    <HelperText>
                      Click en el diagrama del activo para marcar ubicación exacta de daños
                    </HelperText>
                  </Field>

                  <Alert status="info" variant="subtle">
                    <AlertIcon />
                    <Text fontSize="sm">
                      💡 Se generará un diagrama interactivo basado en el tipo de activo
                    </Text>
                  </Alert>
                </>
              )}

              {/* AI-powered (future) */}
              {formData.condition_tracking.inspection_type === 'ai_powered' && (
                <Alert status="warning" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Feature en desarrollo</Text>
                    <Text fontSize="sm">
                      AI damage detection con DeGould 4.0 - Coming soon
                    </Text>
                  </Box>
                </Alert>
              )}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>

    {/* ========== SECURITY DEPOSIT ========== */}
    <Divider />

    <Field>
      <Switch
        checked={formData.security_deposit?.required ?? false}
        onCheckedChange={(e) => handleChange('security_deposit.required', e.checked)}
      >
        Requerir depósito de garantía
      </Switch>
      <HelperText>
        Monto que se retiene para cubrir posibles daños
      </HelperText>
    </Field>

    {formData.security_deposit?.required && (
      <Card variant="outline" bg="orange.50">
        <CardBody>
          <Stack gap={4}>
            <Heading size="sm">Configuración del Depósito</Heading>

            <Field label="Método de cálculo" required>
              <RadioGroup
                value={formData.security_deposit.amount ? 'fixed' : 'percentage'}
                onValueChange={(details) => {
                  if (details.value === 'fixed') {
                    handleChange('security_deposit.percentage_of_rental', null)
                  } else {
                    handleChange('security_deposit.amount', null)
                  }
                }}
              >
                <Stack gap={2}>
                  <Radio value="fixed">Monto fijo</Radio>
                  <Radio value="percentage">Porcentaje del alquiler</Radio>
                </Stack>
              </RadioGroup>
            </Field>

            {formData.security_deposit.amount !== undefined && (
              <Field label="Monto del depósito" required>
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="500"
                    value={formData.security_deposit.amount ?? ''}
                    onChange={(e) => handleChange('security_deposit.amount',
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                  />
                </InputGroup>
              </Field>
            )}

            {formData.security_deposit.percentage_of_rental !== undefined && (
              <Field label="Porcentaje del alquiler" required>
                <InputGroup>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={formData.security_deposit.percentage_of_rental ?? ''}
                    onChange={(e) => handleChange('security_deposit.percentage_of_rental',
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
                <HelperText>
                  Ej: 20% = Si alquiler cuesta $1000, depósito es $200
                </HelperText>
              </Field>
            )}

            <Field>
              <Switch
                checked={formData.security_deposit.refundable ?? true}
                onCheckedChange={(e) => handleChange('security_deposit.refundable', e.checked)}
              >
                Depósito reembolsable
              </Switch>
              <HelperText>
                Si no hay daños, el depósito se devuelve al cliente
              </HelperText>
            </Field>

            {formData.security_deposit.refundable && (
              <Field label="Duración de retención">
                <InputGroup>
                  <Input
                    type="number"
                    min="0"
                    placeholder="7"
                    value={formData.security_deposit.hold_duration_days ?? ''}
                    onChange={(e) => handleChange('security_deposit.hold_duration_days',
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                  />
                  <InputRightAddon>días después de devolución</InputRightAddon>
                </InputGroup>
                <HelperText>
                  Tiempo para verificar daños antes de reembolsar
                </HelperText>
              </Field>
            )}
          </Stack>
        </CardBody>
      </Card>
    )}

    {/* ========== INSURANCE CONFIG ========== */}
    <Divider />

    <Field>
      <Switch
        checked={formData.insurance_config?.insurance_required ?? false}
        onCheckedChange={(e) => handleChange('insurance_config.insurance_required', e.checked)}
      >
        Requerir seguro
      </Switch>
      <HelperText>
        Protección contra daños, robo o pérdida del activo
      </HelperText>
    </Field>

    {formData.insurance_config?.insurance_required && (
      <Card variant="outline" bg="green.50">
        <CardBody>
          <Stack gap={4}>
            <Heading size="sm">Configuración de Seguro</Heading>

            <Field label="Proveedor de seguro" required>
              <SelectField
                placeholder="Selecciona proveedor"
                options={[
                  {
                    value: 'self',
                    label: 'Auto-asegurado',
                    description: 'Tu negocio cubre los daños'
                  },
                  {
                    value: 'third_party',
                    label: 'Seguro de terceros',
                    description: 'Compañía de seguros externa'
                  },
                  {
                    value: 'customer',
                    label: 'Seguro del cliente',
                    description: 'Cliente debe tener su propio seguro'
                  }
                ]}
                value={formData.insurance_config.insurance_provider}
                onValueChange={(details) => handleChange('insurance_config.insurance_provider', details.value[0])}
              />
            </Field>

            {formData.insurance_config.insurance_provider === 'self' && (
              <Field label="Costo del seguro por día">
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10"
                    value={formData.insurance_config.insurance_cost_per_day ?? ''}
                    onChange={(e) => handleChange('insurance_config.insurance_cost_per_day',
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                  />
                  <InputRightAddon>/día</InputRightAddon>
                </InputGroup>
                <HelperText>
                  Costo que el cliente paga por el seguro
                </HelperText>
              </Field>
            )}

            <Field>
              <Switch
                checked={formData.insurance_config.liability_waiver_required ?? false}
                onCheckedChange={(e) => handleChange('insurance_config.liability_waiver_required', e.checked)}
              >
                Requerir firma de waiver de responsabilidad
              </Switch>
              <HelperText>
                Cliente acepta términos y condiciones de uso
              </HelperText>
            </Field>

            {formData.insurance_config.liability_waiver_required && (
              <Field label="Cobertura máxima de responsabilidad">
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input
                    type="number"
                    step="100"
                    min="0"
                    placeholder="10000"
                    value={formData.insurance_config.max_liability_coverage ?? ''}
                    onChange={(e) => handleChange('insurance_config.max_liability_coverage',
                      e.target.value ? parseFloat(e.target.value) : null
                    )}
                  />
                </InputGroup>
                <HelperText>
                  Monto máximo que cubre el seguro/waiver
                </HelperText>
              </Field>
            )}
          </Stack>
        </CardBody>
      </Card>
    )}

    {/* ========== MAINTENANCE CONFIG ========== */}
    {/* TODO: Integrar con maintenance scheduling system */}
    <Divider />

    <Stack gap={3}>
      <Heading size="sm">Mantenimiento Preventivo</Heading>
      <Text fontSize="sm" color="gray.600">
        Trackeo de uso y programación de mantenimiento
      </Text>

      <Field>
        <Switch
          checked={formData.maintenance_config?.track_usage ?? false}
          onCheckedChange={(e) => handleChange('maintenance_config.track_usage', e.checked)}
        >
          Trackear uso del activo
        </Switch>
        <HelperText>
          Registrar kilometraje, horas de uso, ciclos, etc.
        </HelperText>
      </Field>

      {formData.maintenance_config?.track_usage && (
        <Card variant="outline" bg="purple.50">
          <CardBody>
            <Stack gap={3}>
              <Field label="Unidad de medida" required>
                <SelectField
                  placeholder="Selecciona unidad"
                  options={[
                    { value: 'hours', label: 'Horas de uso' },
                    { value: 'kilometers', label: 'Kilómetros' },
                    { value: 'days', label: 'Días de alquiler' },
                    { value: 'cycles', label: 'Ciclos/usos' }
                  ]}
                  value={formData.maintenance_config.usage_unit}
                  onValueChange={(details) => handleChange('maintenance_config.usage_unit', details.value[0])}
                />
              </Field>

              <Field label="Intervalo de mantenimiento">
                <InputGroup>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={formData.maintenance_config.maintenance_interval ?? ''}
                    onChange={(e) => handleChange('maintenance_config.maintenance_interval',
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                  />
                  <InputRightAddon>
                    {formData.maintenance_config.usage_unit || 'unidades'}
                  </InputRightAddon>
                </InputGroup>
                <HelperText>
                  Cada cuánto realizar mantenimiento (ej: cada 1000 km)
                </HelperText>
              </Field>

              <Field label="Último mantenimiento">
                <Input
                  type="date"
                  value={formData.maintenance_config.last_maintenance_date
                    ? formatDateForInput(formData.maintenance_config.last_maintenance_date)
                    : ''}
                  onChange={(e) => handleChange('maintenance_config.last_maintenance_date',
                    e.target.value ? new Date(e.target.value) : null
                  )}
                />
              </Field>

              <Alert status="info" variant="subtle">
                <AlertIcon />
                <Text fontSize="sm">
                  El sistema calculará automáticamente cuándo es el próximo mantenimiento
                </Text>
              </Alert>
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>

    {/* ========== AVAILABILITY CONFIG ========== */}
    <Divider />

    <Stack gap={3}>
      <Heading size="sm">Disponibilidad</Heading>

      <Grid columns={2} gap={3}>
        <Field label="Duración mínima de alquiler" required>
          {/*
            TODO: Usar DurationInput component de Scheduling module
            import { DurationInput } from '@/modules/scheduling/components'

            <DurationInput
              value={formData.availability_config.min_rental_duration_minutes}
              displayUnit={formData.pricing_model === 'hourly' ? 'hours' : 'days'}
              onChange={(minutes) => handleChange('availability_config.min_rental_duration_minutes', minutes)}
            />
          */}
          <InputGroup>
            <Input
              type="number"
              min="1"
              placeholder="1"
              value={formData.availability_config?.min_rental_duration_minutes
                ? (formData.pricing_model === 'hourly'
                    ? formData.availability_config.min_rental_duration_minutes / 60
                    : formData.availability_config.min_rental_duration_minutes / (60 * 24))
                : ''}
              onChange={(e) => {
                const inputValue = parseInt(e.target.value)
                const minutes = formData.pricing_model === 'hourly'
                  ? inputValue * 60  // horas → minutos
                  : inputValue * 60 * 24  // días → minutos
                handleChange('availability_config.min_rental_duration_minutes', minutes)
              }}
            />
            <InputRightAddon>
              {formData.pricing_model === 'hourly' ? 'horas' : 'días'}
            </InputRightAddon>
          </InputGroup>
          <HelperText>Se almacena internamente en minutos</HelperText>
        </Field>

        <Field label="Duración máxima de alquiler">
          <InputGroup>
            <Input
              type="number"
              min="1"
              placeholder="Ilimitado"
              value={formData.availability_config?.max_rental_duration_minutes
                ? (formData.pricing_model === 'hourly'
                    ? formData.availability_config.max_rental_duration_minutes / 60
                    : formData.availability_config.max_rental_duration_minutes / (60 * 24))
                : ''}
              onChange={(e) => {
                if (!e.target.value) {
                  handleChange('availability_config.max_rental_duration_minutes', null)
                  return
                }
                const inputValue = parseInt(e.target.value)
                const minutes = formData.pricing_model === 'hourly'
                  ? inputValue * 60
                  : inputValue * 60 * 24
                handleChange('availability_config.max_rental_duration_minutes', minutes)
              }}
            />
            <InputRightAddon>
              {formData.pricing_model === 'hourly' ? 'horas' : 'días'}
            </InputRightAddon>
          </InputGroup>
          <HelperText>
            Deja vacío para ilimitado. Se almacena internamente en minutos
          </HelperText>
        </Field>
      </Grid>

      <Field label="Tiempo de buffer entre rentas" required>
        <InputGroup>
          <Input
            type="number"
            min="0"
            placeholder="120"
            value={formData.availability_config?.buffer_time_minutes ?? ''}
            onChange={(e) => handleChange('availability_config.buffer_time_minutes',
              parseInt(e.target.value)
            )}
          />
          <InputRightAddon>minutos</InputRightAddon>
        </InputGroup>
        <HelperText>
          Tiempo para limpieza, mantenimiento y preparación entre alquileres
        </HelperText>
      </Field>

      {/* TODO: Blackout dates calendar picker */}
      <Field label="Fechas bloqueadas">
        <Button variant="outline" onClick={handleOpenBlackoutCalendar}>
          Configurar fechas no disponibles
        </Button>
        <HelperText>
          Bloquear fechas específicas (ej: mantenimiento programado, eventos especiales)
        </HelperText>
      </Field>

      <Field>
        <Switch
          checked={formData.availability_config?.seasonal_availability ?? false}
          onCheckedChange={(e) => handleChange('availability_config.seasonal_availability', e.checked)}
        >
          Disponibilidad estacional
        </Switch>
        <HelperText>
          Solo disponible en ciertas épocas del año (ej: equipo de ski solo en invierno)
        </HelperText>
      </Field>
    </Stack>

    {/* ========== GPS TRACKING ========== */}
    {/* NOTE: Común para assets de alto valor (autos, equipo costoso) */}
    <Divider />

    <Field>
      <Switch
        checked={formData.tracking_config?.gps_enabled ?? false}
        onCheckedChange={(e) => handleChange('tracking_config.gps_enabled', e.checked)}
      >
        Habilitar tracking GPS
      </Switch>
      <HelperText>
        Monitorear ubicación del activo en tiempo real (recomendado para autos, equipo costoso)
      </HelperText>
    </Field>

    {formData.tracking_config?.gps_enabled && (
      <Card variant="outline" bg="red.50">
        <CardBody>
          <Stack gap={3}>
            <Heading size="sm">Configuración de GPS</Heading>

            <Field label="ID del dispositivo GPS">
              <Input
                placeholder="ej: GPS-12345"
                value={formData.tracking_config.gps_device_id ?? ''}
                onChange={(e) => handleChange('tracking_config.gps_device_id', e.target.value)}
              />
              <HelperText>
                Identificador del GPS instalado en el activo
              </HelperText>
            </Field>

            <Field>
              <Switch
                checked={formData.tracking_config.geofence_enabled ?? false}
                onCheckedChange={(e) => handleChange('tracking_config.geofence_enabled', e.checked)}
              >
                Habilitar geofencing
              </Switch>
              <HelperText>
                Alertas si el activo sale del área permitida
              </HelperText>
            </Field>

            {formData.tracking_config.geofence_enabled && (
              <Field label="Radio del geofence">
                <InputGroup>
                  <Input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.tracking_config.geofence_radius_km ?? ''}
                    onChange={(e) => handleChange('tracking_config.geofence_radius_km',
                      parseInt(e.target.value)
                    )}
                  />
                  <InputRightAddon>km</InputRightAddon>
                </InputGroup>
              </Field>
            )}

            <Field label="Intervalo de tracking">
              <InputGroup>
                <Input
                  type="number"
                  min="1"
                  placeholder="15"
                  value={formData.tracking_config.tracking_interval_minutes ?? ''}
                  onChange={(e) => handleChange('tracking_config.tracking_interval_minutes',
                    parseInt(e.target.value)
                  )}
                />
                <InputRightAddon>minutos</InputRightAddon>
              </InputGroup>
              <HelperText>
                Frecuencia de actualización de ubicación (menor = más preciso pero más batería)
              </HelperText>
            </Field>
          </Stack>
        </CardBody>
      </Card>
    )}

    {/* ========== USAGE RESTRICTIONS ========== */}
    <Divider />

    <Stack gap={3}>
      <Heading size="sm">Restricciones de Uso</Heading>

      <Field>
        <Switch
          checked={formData.usage_restrictions?.requires_license ?? false}
          onCheckedChange={(e) => handleChange('usage_restrictions.requires_license', e.checked)}
        >
          Requiere licencia
        </Switch>
        <HelperText>
          Cliente debe tener licencia válida (ej: licencia de conducir, certificación)
        </HelperText>
      </Field>

      {formData.usage_restrictions?.requires_license && (
        <Field label="Tipo de licencia requerida">
          <Input
            placeholder='ej: "Licencia de conducir clase B"'
            value={formData.usage_restrictions.license_type ?? ''}
            onChange={(e) => handleChange('usage_restrictions.license_type', e.target.value)}
          />
        </Field>
      )}

      <Field>
        <Switch
          checked={formData.usage_restrictions?.requires_certification ?? false}
          onCheckedChange={(e) => handleChange('usage_restrictions.requires_certification', e.checked)}
        >
          Requiere certificación
        </Switch>
        <HelperText>
          Cliente debe estar certificado para operar (ej: operador de grúa, soldador)
        </HelperText>
      </Field>

      {formData.usage_restrictions?.requires_certification && (
        <Field label="Tipo de certificación requerida">
          <Input
            placeholder='ej: "Certificación de operador de grúa"'
            value={formData.usage_restrictions.certification_type ?? ''}
            onChange={(e) => handleChange('usage_restrictions.certification_type', e.target.value)}
          />
        </Field>
      )}

      <Field label="Edad mínima">
        <InputGroup>
          <Input
            type="number"
            min="0"
            placeholder="18"
            value={formData.usage_restrictions?.age_restriction ?? ''}
            onChange={(e) => handleChange('usage_restrictions.age_restriction',
              e.target.value ? parseInt(e.target.value) : null
            )}
          />
          <InputRightAddon>años</InputRightAddon>
        </InputGroup>
      </Field>

      {/* Asset-specific restrictions */}
      {formData.asset_category === 'vehicle' && (
        <>
          <Field label="Pasajeros máximos">
            <Input
              type="number"
              min="1"
              placeholder="5"
              value={formData.usage_restrictions?.max_passengers ?? ''}
              onChange={(e) => handleChange('usage_restrictions.max_passengers',
                e.target.value ? parseInt(e.target.value) : null
              )}
            />
          </Field>

          <Field label="Terreno permitido">
            <CheckboxGroup
              value={formData.usage_restrictions?.allowed_terrain ?? []}
              onValueChange={(details) => handleChange('usage_restrictions.allowed_terrain', details.value)}
            >
              <Stack gap={2}>
                <Checkbox value="paved">Pavimento</Checkbox>
                <Checkbox value="gravel">Grava</Checkbox>
                <Checkbox value="off_road">Off-road</Checkbox>
                <Checkbox value="highway">Autopista</Checkbox>
              </Stack>
            </CheckboxGroup>
          </Field>
        </>
      )}

      {formData.asset_category === 'equipment' && (
        <Field label="Peso máximo soportado">
          <InputGroup>
            <Input
              type="number"
              min="0"
              placeholder="500"
              value={formData.usage_restrictions?.max_weight_kg ?? ''}
              onChange={(e) => handleChange('usage_restrictions.max_weight_kg',
                e.target.value ? parseInt(e.target.value) : null
              )}
            />
            <InputRightAddon>kg</InputRightAddon>
          </InputGroup>
          <HelperText>
            Capacidad máxima del equipo
          </HelperText>
        </Field>
      )}
    </Stack>

    {/* ========== ACCESSORIES ========== */}
    {/* NOTE: Upselling opportunity - GPS, child seats, insurance upgrades */}
    <Divider />

    <Stack gap={3}>
      <HStack justify="space-between">
        <Heading size="sm">Accesorios y Extras</Heading>
        <Button
          size="sm"
          variant="outline"
          colorPalette="purple"
          onClick={handleAddAccessory}
        >
          <PlusIcon />
          Agregar Accesorio
        </Button>
      </HStack>

      <Text fontSize="sm" color="gray.600">
        Extras que el cliente puede agregar al alquiler (GPS, silla para niños, etc.)
      </Text>

      {formData.accessories?.length === 0 && (
        <EmptyState
          title="Sin accesorios"
          description="Agrega extras opcionales para incrementar ingresos"
          icon={<PuzzleIcon />}
        />
      )}

      {formData.accessories?.map((accessory, index) => (
        <AccessoryRow
          key={accessory.id}
          accessory={accessory}
          onUpdate={(updated) => updateAccessory(index, updated)}
          onRemove={() => removeAccessory(index)}
        />
      ))}
    </Stack>

    {/* Summary */}
    <Alert status="success" variant="subtle">
      <AlertIcon />
      <Box>
        <Text fontWeight="bold">
          Configuración completada
        </Text>
        <Text fontSize="sm">
          {formData.condition_tracking?.require_pre_rental_inspection && '✓ Inspección pre-alquiler • '}
          {formData.security_deposit?.required && `✓ Depósito $${formData.security_deposit.amount || 'variable'} • `}
          {formData.tracking_config?.gps_enabled && '✓ GPS tracking • '}
          {formData.maintenance_config?.track_usage && '✓ Tracking de uso'}
        </Text>
      </Box>
    </Alert>
  </Stack>
</FormSection>
```

### Componentes Auxiliares

```tsx
/**
 * Component: InspectionItemRow
 * Renders a single inspection checklist item
 */
interface InspectionItemRowProps {
  item: InspectionItem
  onUpdate: (item: InspectionItem) => void
  onRemove: () => void
}

function InspectionItemRow({ item, onUpdate, onRemove }: InspectionItemRowProps) {
  return (
    <Card variant="outline">
      <CardBody>
        <Grid columns={12} gap={2}>
          {/* Category */}
          <GridItem colSpan={2}>
            <Input
              size="sm"
              placeholder="Categoría"
              value={item.category}
              onChange={(e) => onUpdate({ ...item, category: e.target.value })}
            />
          </GridItem>

          {/* Item name */}
          <GridItem colSpan={4}>
            <Input
              size="sm"
              placeholder="Nombre del ítem"
              value={item.item}
              onChange={(e) => onUpdate({ ...item, item: e.target.value })}
            />
          </GridItem>

          {/* Condition options */}
          <GridItem colSpan={4}>
            <CheckboxGroup
              size="sm"
              value={item.condition_options}
              onValueChange={(details) => onUpdate({
                ...item,
                condition_options: details.value as InspectionItem['condition_options']
              })}
            >
              <HStack gap={1}>
                <Checkbox value="excellent">Exc</Checkbox>
                <Checkbox value="good">Bien</Checkbox>
                <Checkbox value="fair">Regular</Checkbox>
                <Checkbox value="poor">Mal</Checkbox>
                <Checkbox value="damaged">Dañado</Checkbox>
              </HStack>
            </CheckboxGroup>
          </GridItem>

          {/* Actions */}
          <GridItem colSpan={2}>
            <HStack gap={1} justify="flex-end">
              <Checkbox
                size="sm"
                checked={item.requires_photo_if_damaged}
                onCheckedChange={(e) => onUpdate({
                  ...item,
                  requires_photo_if_damaged: e.checked
                })}
              >
                📷
              </Checkbox>
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onRemove}
              >
                <TrashIcon />
              </IconButton>
            </HStack>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}

/**
 * Component: AccessoryRow
 * Renders a rental accessory/extra
 */
interface AccessoryRowProps {
  accessory: AssetAccessory
  onUpdate: (accessory: AssetAccessory) => void
  onRemove: () => void
}

function AccessoryRow({ accessory, onUpdate, onRemove }: AccessoryRowProps) {
  return (
    <Card variant="outline">
      <CardBody>
        <Grid columns={12} gap={3}>
          {/* Name */}
          <GridItem colSpan={4}>
            <Input
              placeholder="Nombre del accesorio"
              value={accessory.name}
              onChange={(e) => onUpdate({ ...accessory, name: e.target.value })}
            />
          </GridItem>

          {/* Description */}
          <GridItem colSpan={4}>
            <Input
              placeholder="Descripción breve"
              value={accessory.description ?? ''}
              onChange={(e) => onUpdate({ ...accessory, description: e.target.value })}
            />
          </GridItem>

          {/* Price per day */}
          <GridItem colSpan={2}>
            <InputGroup>
              <InputLeftAddon>$</InputLeftAddon>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={accessory.price_per_day}
                onChange={(e) => onUpdate({
                  ...accessory,
                  price_per_day: parseFloat(e.target.value)
                })}
              />
            </InputGroup>
          </GridItem>

          {/* Required + Actions */}
          <GridItem colSpan={2}>
            <HStack justify="space-between">
              <Checkbox
                checked={accessory.required}
                onCheckedChange={(e) => onUpdate({
                  ...accessory,
                  required: e.checked
                })}
              >
                Obligatorio
              </Checkbox>
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onRemove}
              >
                <TrashIcon />
              </IconButton>
            </HStack>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}
```

### Validaciones

```typescript
function validateAssetConfig(
  data: AssetConfigFields
): ValidationError[] {
  const errors: ValidationError[] = []

  // Asset selection mode requerido
  if (!data.asset_selection_mode) {
    errors.push({
      field: 'asset_selection_mode',
      message: 'Selecciona un modo de selección de activo',
      severity: 'error'
    })
  }

  // Validar según modo
  if (data.asset_selection_mode === 'specific' && !data.specific_asset_id) {
    errors.push({
      field: 'specific_asset_id',
      message: 'Selecciona un activo específico',
      severity: 'error'
    })
  }

  if (data.asset_selection_mode === 'category' && !data.asset_category) {
    errors.push({
      field: 'asset_category',
      message: 'Ingresa la categoría del activo',
      severity: 'error'
    })
  }

  // Depreciation validations
  if (!data.depreciation_config?.method) {
    errors.push({
      field: 'depreciation_config.method',
      message: 'Selecciona un método de depreciación',
      severity: 'error'
    })
  }

  if (data.depreciation_config?.method === 'straight_line') {
    if (!data.depreciation_config.useful_life_years ||
        data.depreciation_config.useful_life_years < 1) {
      errors.push({
        field: 'depreciation_config.useful_life_years',
        message: 'Ingresa la vida útil en años',
        severity: 'error'
      })
    }
  }

  // Condition tracking validations
  if (!data.condition_tracking) {
    errors.push({
      field: 'condition_tracking',
      message: 'Configura el seguimiento de condición',
      severity: 'error'
    })
  } else {
    if ((data.condition_tracking.require_pre_rental_inspection ||
         data.condition_tracking.require_post_rental_inspection) &&
        !data.condition_tracking.inspection_type) {
      errors.push({
        field: 'condition_tracking.inspection_type',
        message: 'Selecciona el tipo de inspección',
        severity: 'error'
      })
    }

    // BEST PRACTICE WARNING
    if (!data.condition_tracking.require_pre_rental_inspection &&
        !data.condition_tracking.require_post_rental_inspection) {
      errors.push({
        field: 'condition_tracking',
        message: 'Recomendado: Habilitar inspecciones para prevenir disputas (reduce 90% - DAMAGE iD)',
        severity: 'warning'
      })
    }

    // Checklist validation
    if (data.condition_tracking.inspection_type === 'checklist') {
      if (!data.condition_tracking.inspection_checklist ||
          data.condition_tracking.inspection_checklist.length === 0) {
        errors.push({
          field: 'condition_tracking.inspection_checklist',
          message: 'Agrega al menos un ítem al checklist',
          severity: 'error'
        })
      }
    }
  }

  // Security deposit validations
  if (data.security_deposit?.required) {
    const hasAmount = data.security_deposit.amount !== undefined &&
                     data.security_deposit.amount !== null
    const hasPercentage = data.security_deposit.percentage_of_rental !== undefined &&
                         data.security_deposit.percentage_of_rental !== null

    if (!hasAmount && !hasPercentage) {
      errors.push({
        field: 'security_deposit',
        message: 'Define el monto del depósito (fijo o porcentaje)',
        severity: 'error'
      })
    }

    if (hasAmount && data.security_deposit.amount! <= 0) {
      errors.push({
        field: 'security_deposit.amount',
        message: 'El depósito debe ser mayor a 0',
        severity: 'error'
      })
    }

    if (hasPercentage && (
        data.security_deposit.percentage_of_rental! <= 0 ||
        data.security_deposit.percentage_of_rental! > 100)) {
      errors.push({
        field: 'security_deposit.percentage_of_rental',
        message: 'El porcentaje debe estar entre 0 y 100',
        severity: 'error'
      })
    }
  }

  // Insurance validations
  if (data.insurance_config?.insurance_required) {
    if (!data.insurance_config.insurance_provider) {
      errors.push({
        field: 'insurance_config.insurance_provider',
        message: 'Selecciona el proveedor de seguro',
        severity: 'error'
      })
    }
  }

  // Availability validations
  if (!data.availability_config?.min_rental_duration ||
      data.availability_config.min_rental_duration < 1) {
    errors.push({
      field: 'availability_config.min_rental_duration',
      message: 'Define la duración mínima de alquiler',
      severity: 'error'
    })
  }

  if (data.availability_config?.buffer_time_hours === undefined ||
      data.availability_config.buffer_time_hours < 0) {
    errors.push({
      field: 'availability_config.buffer_time_hours',
      message: 'Define el tiempo de buffer (puede ser 0)',
      severity: 'error'
    })
  }

  // GPS tracking validations
  if (data.tracking_config?.gps_enabled) {
    if (!data.tracking_config.gps_device_id) {
      errors.push({
        field: 'tracking_config.gps_device_id',
        message: 'Ingresa el ID del dispositivo GPS',
        severity: 'warning'
      })
    }
  }

  // Usage restrictions validations
  if (data.usage_restrictions?.requires_license &&
      !data.usage_restrictions.license_type) {
    errors.push({
      field: 'usage_restrictions.license_type',
      message: 'Especifica el tipo de licencia requerida',
      severity: 'error'
    })
  }

  if (data.usage_restrictions?.requires_certification &&
      !data.usage_restrictions.certification_type) {
    errors.push({
      field: 'usage_restrictions.certification_type',
      message: 'Especifica el tipo de certificación requerida',
      severity: 'error'
    })
  }

  // Accessories validations
  data.accessories?.forEach((accessory, index) => {
    if (!accessory.name || accessory.name.trim().length === 0) {
      errors.push({
        field: `accessories[${index}].name`,
        message: 'El accesorio necesita un nombre',
        severity: 'error'
      })
    }

    if (!accessory.price_per_day || accessory.price_per_day < 0) {
      errors.push({
        field: `accessories[${index}].price_per_day`,
        message: 'Define el precio del accesorio',
        severity: 'error'
      })
    }
  })

  return errors
}
```

### Cálculos y Lógica de Negocio

```typescript
/**
 * Calcula el costo de depreciación por rental
 * CRITICAL: Este costo afecta directamente al pricing (Variante B)
 */
function calculateDepreciationPerRental(
  data: AssetConfigFields,
  rentalDurationDays: number
): number {
  const config = data.depreciation_config

  if (!config || config.method === 'none') return 0

  const currentValue = data.asset_details?.current_value || 0
  const purchasePrice = data.asset_details?.purchase_price || currentValue

  switch (config.method) {
    case 'straight_line': {
      // Annual depreciation = (Purchase Price - Salvage Value) / Useful Life
      const salvageValue = config.salvage_value || 0
      const usefulLifeYears = config.useful_life_years || 1

      const annualDepreciation = (purchasePrice - salvageValue) / usefulLifeYears
      const dailyDepreciation = annualDepreciation / 365

      return dailyDepreciation * rentalDurationDays
    }

    case 'declining_balance': {
      // Declining balance = Current Value × Rate
      // TODO: Implementar cálculo más preciso considerando edad del asset
      const rate = (config.depreciation_rate || 20) / 100
      const annualDepreciation = currentValue * rate
      const dailyDepreciation = annualDepreciation / 365

      return dailyDepreciation * rentalDurationDays
    }

    case 'units_of_production': {
      // Depreciation per unit = (Purchase Price - Salvage Value) / Total Units
      const salvageValue = config.salvage_value || 0
      const totalUnits = config.total_units || 1

      const depreciationPerUnit = (purchasePrice - salvageValue) / totalUnits

      // TODO: Calcular unidades usadas en este rental
      // Por ahora asumimos uso promedio
      const averageUnitsPerDay = totalUnits / (config.useful_life_years || 5) / 365
      const unitsThisRental = averageUnitsPerDay * rentalDurationDays

      return depreciationPerUnit * unitsThisRental
    }

    default:
      return 0
  }
}

/**
 * Genera checklist template según tipo de asset
 */
function loadChecklistTemplate(templateType: 'vehicle' | 'equipment' | 'space'): InspectionItem[] {
  switch (templateType) {
    case 'vehicle':
      return [
        {
          id: generateId(),
          category: 'Exterior',
          item: 'Parabrisas delantero',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Exterior',
          item: 'Parachoques delantero',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Exterior',
          item: 'Puertas (4)',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Interior',
          item: 'Asientos',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Interior',
          item: 'Panel de instrumentos',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: false,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Mecánico',
          item: 'Nivel de aceite',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Mecánico',
          item: 'Llantas',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Mecánico',
          item: 'Nivel de combustible',
          condition_options: ['excellent', 'good', 'fair'],
          requires_photo_if_damaged: false,
          notes_required: true
        }
      ]

    case 'equipment':
      return [
        {
          id: generateId(),
          category: 'Estructura',
          item: 'Carcasa/frame',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Funcionalidad',
          item: 'Encendido/arranque',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Funcionalidad',
          item: 'Controles operativos',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Seguridad',
          item: 'Guardas de seguridad',
          condition_options: ['excellent', 'good', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Accesorios',
          item: 'Cable de poder/baterías',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: false
        }
      ]

    case 'space':
      return [
        {
          id: generateId(),
          category: 'Paredes',
          item: 'Pintura/acabado',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Piso',
          item: 'Alfombra/baldosas',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Mobiliario',
          item: 'Mesas',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Mobiliario',
          item: 'Sillas',
          condition_options: ['excellent', 'good', 'fair', 'poor', 'damaged'],
          requires_photo_if_damaged: true,
          notes_required: false
        },
        {
          id: generateId(),
          category: 'Equipamiento',
          item: 'Proyector/pantalla',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: true
        },
        {
          id: generateId(),
          category: 'Limpieza',
          item: 'Limpieza general',
          condition_options: ['excellent', 'good', 'fair', 'poor'],
          requires_photo_if_damaged: false,
          notes_required: true
        }
      ]

    default:
      return []
  }
}
```

### Integration Points

```typescript
/**
 * INTEGRATION POINTS CON OTROS MÓDULOS
 *
 * TODO: Implementar cuando los módulos estén disponibles
 */

// 1. ASSETS MODULE
// → Listar assets disponibles para selección
// → Obtener asset details (serial, value, purchase_date)
// → Actualizar asset status (available/rented/maintenance)
// → Track asset usage (kms, hours, etc.)

// 2. BOOKING MODULE (Scheduling)
// → Validar disponibilidad de asset en fechas solicitadas
// → Considerar buffer_time entre rentals
// → Blackout dates
// → Seasonal availability

// 3. MAINTENANCE MODULE (future)
// → Programar mantenimiento preventivo
// → Alertas cuando se acerca maintenance_interval
// → Bloquear asset si mantenimiento vencido
// → Historial de reparaciones

// 4. GPS TRACKING SERVICE (future - third-party)
// → Integrar con proveedor de GPS (ej: Samsara, Geotab)
// → Real-time tracking
// → Geofence alerts
// → Usage reports (km driven, hours operated)

// 5. INSURANCE PROVIDERS (future - third-party)
// → Integrar con proveedores de seguro
// → Cotizaciones automáticas
// → Claims processing

// 6. DAMAGE DETECTION AI (future - third-party)
// → Integrar con DeGould 4.0 o similar
// → Automatic damage detection from photos
// → AI-generated inspection reports
```

### Edge Cases y Consideraciones

```typescript
/**
 * EDGE CASE 1: Asset Overbooking
 *
 * Si asset_selection_mode = 'specific' y ya está rentado:
 * → Mostrar error al hacer booking
 * → Sugerir asset similar de la misma categoría
 * → O cambiar a modo 'category'
 */

/**
 * EDGE CASE 2: Asset Under Maintenance
 *
 * Si asset necesita mantenimiento:
 * → Bloquear automáticamente en calendario
 * → NO permitir nuevos bookings hasta completar mantenimiento
 * → Notificar admin si booking existente afectado
 */

/**
 * EDGE CASE 3: GPS Tracking Failure
 *
 * Si GPS deja de reportar:
 * → Alertar al admin
 * → Enviar notificación al cliente (verificar si está bien)
 * → Protocolo de asset perdido/robado
 */

/**
 * EDGE CASE 4: Damage Dispute
 *
 * Si cliente disputa cargo por daño:
 * → Mostrar pre/post inspection con timestamps
 * → Photos/videos con geolocation
 * → Waiver firmado
 * → Interactive diagram mostrando exactamente qué cambió
 */

/**
 * EDGE CASE 5: Depreciation Calculation Error
 *
 * Si current_value < salvage_value:
 * → WARNING: Asset may be over-depreciated
 * → Sugerir ajustar salvage_value
 * → O cambiar método de depreciación
 */

/**
 * EDGE CASE 6: Security Deposit Refund
 *
 * Después de hold_duration_days:
 * → Si no hay daños detectados: auto-refund
 * → Si hay daños: retener monto + enviar invoice por diferencia
 * → Si cliente disputa: proceso de resolución
 */
```

---

## ✅ SECCIÓN ASSET CONFIG - COMPLETA

### Resumen de lo Implementado

1. ✅ **3 modos de selección**: specific/category/any_available
2. ✅ **Depreciation tracking**: 3 métodos (straight_line, declining_balance, units_of_production)
3. ✅ **Digital inspections**: 4 tipos (checklist, photo/video, interactive_diagram, AI-powered)
4. ✅ **Security deposit**: Fixed o percentage-based
5. ✅ **Insurance config**: 3 provider options
6. ✅ **Maintenance tracking**: Usage-based preventive maintenance
7. ✅ **Availability management**: min/max duration, buffer time, blackout dates
8. ✅ **GPS tracking**: Real-time location + geofencing
9. ✅ **Usage restrictions**: License, certification, age, terrain
10. ✅ **Accessories/add-ons**: Upselling opportunity
11. ✅ **Checklist templates**: Vehicle/Equipment/Space pre-built

### Research-Driven Features

- **DAMAGE iD**: Digital inspections reduce disputes by 90%
- **RentalMan**: 12+ depreciation methods (implemented 3 most common)
- **EZRentOut**: End-to-end rental management best practices
- **DeGould 4.0**: AI-powered damage detection (futuro)

### Key Decisions Documentadas

- `TODO`: Integrar con Assets module para asset selection
- `NOTE`: GPS tracking común para high-value assets
- `CRITICAL`: Digital inspections = 90% dispute reduction
- `TODO`: AI-powered inspections (DeGould integration)
- `TODO`: Maintenance scheduling system integration

### Integración con Módulo Scheduling

**CRÍTICO**: Asset Config debe articular completamente con el módulo de Scheduling.

#### Interfaces Compartidas:
```typescript
// src/modules/scheduling/types/booking.ts
export interface BaseAvailabilityConfig {
  min_duration_minutes: number
  max_duration_minutes?: number
  buffer_time_minutes: number
  blackout_dates?: Date[]
  concurrent_capacity: number
}

// Asset Config reutiliza y extiende:
interface RentalAvailabilityConfig extends BaseAvailabilityConfig {
  seasonal_availability?: boolean
  geofence_enabled?: boolean
  // ... rental-specific fields
}
```

#### Componentes UI Reutilizables:
```typescript
// Calendario para blackout dates
import { BlackoutDatesPicker } from '@/modules/scheduling/components'

// En Asset Config:
<BlackoutDatesPicker
  value={formData.availability_config?.blackout_dates}
  onChange={(dates) => handleChange('availability_config.blackout_dates', dates)}
/>

// DurationInput component
import { DurationInput } from '@/modules/scheduling/components'

<DurationInput
  value={formData.availability_config.min_rental_duration_minutes}
  displayUnit={formData.pricing_model === 'hourly' ? 'hours' : 'days'}
  onChange={(minutes) => handleChange('availability_config.min_rental_duration_minutes', minutes)}
/>
```

#### Lógica de Validación:
```typescript
// Reutilizar validaciones de scheduling
import {
  validateBookingWindow,
  validateBufferTime
} from '@/modules/scheduling/services/validationService'

function validateAssetAvailability(data: AssetConfigFields) {
  const errors: ValidationError[] = []

  // Validar buffer time
  const bufferValidation = validateBufferTime(data.availability_config.buffer_time_minutes)
  if (!bufferValidation.valid) {
    errors.push(...bufferValidation.errors)
  }

  // Validar duración mínima/máxima
  if (data.availability_config.max_rental_duration_minutes &&
      data.availability_config.max_rental_duration_minutes < data.availability_config.min_rental_duration_minutes) {
    errors.push({
      field: 'availability_config.max_rental_duration_minutes',
      message: 'La duración máxima debe ser mayor a la mínima',
      severity: 'error'
    })
  }

  return errors
}
```

#### Helper Functions (desde Scheduling):
```typescript
// src/modules/scheduling/utils/duration.ts
export const minutesToHours = (minutes: number): number => minutes / 60
export const minutesToDays = (minutes: number): number => minutes / (60 * 24)
export const hoursToMinutes = (hours: number): number => hours * 60
export const daysToMinutes = (days: number): number => days * 60 * 24
export const formatDuration = (minutes: number): string => {
  // Human-readable format
}
```

### Próxima Sección

**Production Section** (physical_product) - Nivel 2 complejidad

---
