/**
 * Fiscal Form Enhanced - Using ModuleFactory patterns
 * Migrates from custom form to DynamicForm with real-time tax calculations
 */
import React from 'react';
import { z } from 'zod';
import { DynamicForm, type FormSectionConfig } from '@/shared/components/forms';
import { useFormManager } from '@/shared/hooks/business';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import {
  FiscalCalculations,
  TaxCalculations,
  type InvoiceAnalysis,
  type TaxBreakdown
} from '@/business-logic/shared/FiscalCalculations';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

// Enhanced Invoice schema with tax calculations
const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoice_number: z.string().min(1, "El número de factura es obligatorio"),
  invoice_type: z.enum(['A', 'B', 'C', 'E']).default('B'),
  customer_id: z.string().min(1, "El cliente es obligatorio"),
  customer_name: z.string().min(1, "El nombre del cliente es obligatorio"),
  customer_tax_id: z.string().min(1, "El CUIT/CUIL del cliente es obligatorio"),
  customer_tax_condition: z.enum(['responsable_inscripto', 'monotributo', 'exento', 'consumidor_final']).default('consumidor_final'),
  issue_date: z.string().min(1, "La fecha de emisión es obligatoria"),
  due_date: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  currency: z.enum(['ARS', 'USD', 'EUR']).default('ARS'),
  exchange_rate: z.number().min(0.01).default(1),
  subtotal: z.number().min(0, "El subtotal no puede ser negativo").default(0),
  discount_percentage: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
  tax_percentage: z.number().min(0).max(100).default(21), // IVA 21%
  tax_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  payment_method: z.enum(['cash', 'card', 'transfer', 'check', 'credit']).default('cash'),
  payment_terms: z.enum(['immediate', '15_days', '30_days', '60_days', '90_days']).default('immediate'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  // AFIP specific fields
  cae: z.string().optional(),
  cae_due_date: z.string().optional(),
  fiscal_point: z.string().default('0001'),
  concept: z.enum(['productos', 'servicios', 'productos_y_servicios']).default('productos'),
  // Line items
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unit_price: z.number().min(0),
    tax_rate: z.number().min(0).max(100).default(21),
    total: z.number().min(0)
  })).default([]),
  // Compliance fields
  compliance_status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
  afip_status: z.enum(['not_sent', 'pending', 'approved', 'rejected']).default('not_sent'),
  document_type: z.string().default('FACTURA'),
  legal_text: z.string().optional()
});

type InvoiceFormData = z.infer<typeof InvoiceSchema>;

interface FiscalFormEnhancedProps {
  invoice?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  prefilledCustomer?: string;
}

export function FiscalFormEnhanced({
  invoice,
  onSuccess,
  onCancel,
  prefilledCustomer
}: FiscalFormEnhancedProps) {
  const isEditMode = !!invoice;

  // Form sections configuration using DynamicForm pattern
  const formSections: FormSectionConfig[] = [
    {
      title: "Información de la Factura",
      description: "Datos básicos del comprobante fiscal",
      fields: [
        {
          name: 'invoice_number',
          label: 'Número de Factura',
          type: 'text',
          placeholder: '0001-00000001',
          required: true,
          description: 'Formato: Punto de venta - Número secuencial'
        },
        {
          name: 'invoice_type',
          label: 'Tipo de Comprobante',
          type: 'text', // Would be select: A, B, C, E
          placeholder: 'A, B, C, E',
          required: true
        },
        {
          name: 'issue_date',
          label: 'Fecha de Emisión',
          type: 'date',
          required: true
        },
        {
          name: 'due_date',
          label: 'Fecha de Vencimiento',
          type: 'date',
          required: true
        },
        {
          name: 'fiscal_point',
          label: 'Punto de Venta',
          type: 'text',
          placeholder: '0001',
          description: 'Punto de venta registrado en AFIP'
        },
        {
          name: 'concept',
          label: 'Concepto',
          type: 'text', // Would be select
          placeholder: 'productos, servicios, productos_y_servicios'
        }
      ]
    },
    {
      title: "Datos del Cliente",
      description: "Información fiscal del cliente",
      fields: [
        {
          name: 'customer_id',
          label: 'ID Cliente',
          type: 'text',
          placeholder: 'CUST001',
          required: true
        },
        {
          name: 'customer_name',
          label: 'Razón Social / Nombre',
          type: 'text',
          placeholder: 'Juan Pérez / Empresa SA',
          required: true,
          gridColumn: '1 / -1'
        },
        {
          name: 'customer_tax_id',
          label: 'CUIT/CUIL/DNI',
          type: 'text',
          placeholder: '20-12345678-9',
          required: true
        },
        {
          name: 'customer_tax_condition',
          label: 'Condición Fiscal',
          type: 'text', // Would be select
          placeholder: 'responsable_inscripto, monotributo, exento, consumidor_final'
        }
      ]
    },
    {
      title: "Montos y Cálculos",
      description: "Importes y cálculos tributarios",
      fields: [
        {
          name: 'subtotal',
          label: 'Subtotal ($)',
          type: 'number',
          placeholder: '1000.00',
          description: 'Importe antes de impuestos'
        },
        {
          name: 'discount_percentage',
          label: 'Descuento (%)',
          type: 'number',
          placeholder: '10',
          description: 'Porcentaje de descuento aplicado'
        },
        {
          name: 'tax_percentage',
          label: 'IVA (%)',
          type: 'number',
          placeholder: '21',
          description: 'Alícuota de IVA aplicable'
        },
        {
          name: 'currency',
          label: 'Moneda',
          type: 'text', // Would be select: ARS, USD, EUR
          placeholder: 'ARS, USD, EUR'
        },
        {
          name: 'exchange_rate',
          label: 'Tipo de Cambio',
          type: 'number',
          placeholder: '1.00',
          description: 'Para moneda extranjera'
        }
      ]
    },
    {
      title: "Condiciones de Pago",
      description: "Términos y formas de pago",
      fields: [
        {
          name: 'payment_method',
          label: 'Forma de Pago',
          type: 'text', // Would be select
          placeholder: 'cash, card, transfer, check, credit'
        },
        {
          name: 'payment_terms',
          label: 'Condiciones de Pago',
          type: 'text', // Would be select
          placeholder: 'immediate, 15_days, 30_days, 60_days, 90_days'
        }
      ]
    },
    {
      title: "Observaciones",
      description: "Notas adicionales y observaciones",
      fields: [
        {
          name: 'notes',
          label: 'Observaciones (Cliente)',
          type: 'textarea',
          placeholder: 'Observaciones que aparecerán en la factura...',
          gridColumn: '1 / -1'
        },
        {
          name: 'internal_notes',
          label: 'Notas Internas',
          type: 'textarea',
          placeholder: 'Notas internas para uso administrativo...',
          gridColumn: '1 / -1'
        }
      ]
    }
  ];

  // Enhanced form manager with fiscal calculations
  const { register, errors, watch, submit, isSubmitting } = useFormManager({
    schema: InvoiceSchema,
    defaultValues: {
      invoice_number: invoice?.invoice_number || '',
      invoice_type: invoice?.invoice_type || 'B',
      customer_id: prefilledCustomer || invoice?.customer_id || '',
      customer_name: invoice?.customer_name || '',
      customer_tax_id: invoice?.customer_tax_id || '',
      customer_tax_condition: invoice?.customer_tax_condition || 'consumidor_final',
      issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: invoice?.currency || 'ARS',
      exchange_rate: invoice?.exchange_rate || 1,
      subtotal: invoice?.subtotal || 0,
      discount_percentage: invoice?.discount_percentage || 0,
      discount_amount: invoice?.discount_amount || 0,
      tax_percentage: invoice?.tax_percentage || 21,
      tax_amount: invoice?.tax_amount || 0,
      total_amount: invoice?.total_amount || 0,
      payment_method: invoice?.payment_method || 'cash',
      payment_terms: invoice?.payment_terms || 'immediate',
      notes: invoice?.notes || '',
      internal_notes: invoice?.internal_notes || '',
      fiscal_point: invoice?.fiscal_point || '0001',
      concept: invoice?.concept || 'productos',
      items: invoice?.items || [],
      compliance_status: invoice?.compliance_status || 'draft',
      afip_status: invoice?.afip_status || 'not_sent',
      document_type: invoice?.document_type || 'FACTURA',
      legal_text: invoice?.legal_text || ''
    },
    onSubmit: async (data: InvoiceFormData) => {
      // Enhanced data with fiscal calculations
      const enhancedData = await enhanceInvoiceData(data);

      if (isEditMode) {
        await CRUDHandlers.update(
          () => updateInvoice(invoice.id, enhancedData),
          'Factura',
          () => {
            // Emit fiscal events
            ModuleEventUtils.fiscal.updated(invoice.id, enhancedData);
            ModuleEventUtils.fiscal.taxCalculated(invoice.id, enhancedData.tax_breakdown, enhancedData.tax_amount);
            ModuleEventUtils.analytics.generated('fiscal', {
              action: 'invoice_updated',
              invoiceId: invoice.id,
              changes: enhancedData
            });
            onSuccess?.();
          }
        );
      } else {
        await CRUDHandlers.create(
          () => createInvoice(enhancedData),
          'Factura',
          () => {
            // Emit fiscal events
            ModuleEventUtils.fiscal.created(enhancedData.id, enhancedData);
            ModuleEventUtils.fiscal.taxCalculated(enhancedData.id, enhancedData.tax_breakdown, enhancedData.tax_amount);
            ModuleEventUtils.analytics.generated('fiscal', {
              action: 'invoice_created',
              invoiceData: enhancedData
            });
            onSuccess?.();
          }
        );
      }
    },
    successMessage: {
      title: isEditMode ? 'INVOICE_UPDATED' : 'INVOICE_CREATED',
      description: `Factura ${isEditMode ? 'actualizada' : 'creada'} correctamente`
    },
    resetOnSuccess: !isEditMode
  });

  // Watch form values for real-time fiscal calculations
  const watchedValues = watch();
  const subtotal = watchedValues.subtotal || 0;
  const discountPercentage = watchedValues.discount_percentage || 0;
  const taxPercentage = watchedValues.tax_percentage || 21;
  const exchangeRate = watchedValues.exchange_rate || 1;

  // Real-time fiscal metrics
  const fiscalMetrics = React.useMemo(() => {
    const discountAmount = subtotal * (discountPercentage / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercentage / 100);
    const totalAmount = taxableAmount + taxAmount;

    // Currency conversion
    const totalInARS = watchedValues.currency === 'ARS' ? totalAmount : totalAmount * exchangeRate;

    // Tax breakdown by type
    const taxBreakdown = {
      iva_21: taxPercentage === 21 ? taxAmount : 0,
      iva_105: taxPercentage === 10.5 ? taxAmount : 0,
      iva_27: taxPercentage === 27 ? taxAmount : 0,
      iva_0: taxPercentage === 0 ? 0 : 0,
      exento: taxPercentage === 0 ? taxableAmount : 0
    };

    // Compliance scoring
    const complianceScore = calculateComplianceScore({
      hasCustomerTaxId: !!watchedValues.customer_tax_id,
      hasValidInvoiceType: !!watchedValues.invoice_type,
      hasValidFiscalPoint: !!watchedValues.fiscal_point,
      taxConditionMatch: validateTaxCondition(watchedValues.customer_tax_condition, watchedValues.invoice_type)
    });

    // Cash flow impact
    const paymentTermsDays = getPaymentTermsDays(watchedValues.payment_terms || 'immediate');
    const cashFlowImpact = {
      immediateImpact: watchedValues.payment_terms === 'immediate' ? totalInARS : 0,
      futureImpact: watchedValues.payment_terms !== 'immediate' ? totalInARS : 0,
      daysToCollection: paymentTermsDays,
      discountedValue: totalInARS / (1 + (0.05 * paymentTermsDays / 365)) // 5% annual discount rate
    };

    return {
      discountAmount: Number(discountAmount.toFixed(2)),
      taxableAmount: Number(taxableAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      totalInARS: Number(totalInARS.toFixed(2)),
      taxBreakdown,
      complianceScore,
      cashFlowImpact,
      effectiveTaxRate: subtotal > 0 ? (taxAmount / subtotal) * 100 : 0,
      netMargin: subtotal > 0 ? ((taxableAmount - taxAmount) / subtotal) * 100 : 0
    };
  }, [subtotal, discountPercentage, taxPercentage, exchangeRate, watchedValues]);

  // Helper functions
  const calculateComplianceScore = (factors: any): number => {
    let score = 0;
    if (factors.hasCustomerTaxId) score += 25;
    if (factors.hasValidInvoiceType) score += 25;
    if (factors.hasValidFiscalPoint) score += 25;
    if (factors.taxConditionMatch) score += 25;
    return score;
  };

  const validateTaxCondition = (condition: string | undefined, invoiceType: string | undefined): boolean => {
    if (!condition || !invoiceType) return false;

    // Basic validation rules
    if (invoiceType === 'A' && condition !== 'responsable_inscripto') return false;
    if (invoiceType === 'B' && condition === 'responsable_inscripto') return false;
    if (invoiceType === 'C' && condition !== 'consumidor_final') return false;

    return true;
  };

  const getPaymentTermsDays = (terms: string): number => {
    const daysMap: Record<string, number> = {
      immediate: 0,
      '15_days': 15,
      '30_days': 30,
      '60_days': 60,
      '90_days': 90
    };
    return daysMap[terms] || 0;
  };

  // Enhance invoice data with calculations
  const enhanceInvoiceData = async (data: InvoiceFormData) => {
    return {
      ...data,
      // Calculated amounts
      discount_amount: fiscalMetrics.discountAmount,
      tax_amount: fiscalMetrics.taxAmount,
      total_amount: fiscalMetrics.totalAmount,

      // Tax breakdown
      tax_breakdown: fiscalMetrics.taxBreakdown,

      // Compliance data
      compliance_score: fiscalMetrics.complianceScore,
      is_compliant: fiscalMetrics.complianceScore >= 75,

      // Cash flow analysis
      cash_flow_impact: fiscalMetrics.cashFlowImpact,
      discounted_value: fiscalMetrics.cashFlowImpact.discountedValue,

      // Financial ratios
      effective_tax_rate: fiscalMetrics.effectiveTaxRate,
      net_margin: fiscalMetrics.netMargin,

      // Enhanced metadata
      created_at: invoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // AFIP integration ready
      ready_for_afip: fiscalMetrics.complianceScore >= 100,
      requires_cae: ['A', 'B', 'C'].includes(data.invoice_type),

      // Currency handling
      total_in_ars: fiscalMetrics.totalInARS
    };
  };

  // Mock CRUD operations
  const createInvoice = async (data: any) => {
    console.log('Creating invoice:', data);
    return { id: Date.now().toString(), ...data };
  };

  const updateInvoice = async (id: string, data: any) => {
    console.log('Updating invoice:', id, data);
    return { id, ...data };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <DynamicForm<InvoiceFormData>
        title={isEditMode ? '✏️ Editar Factura' : '📄 Nueva Factura'}
        description="Gestión completa de facturación con cálculos fiscales automáticos"
        schema={InvoiceSchema}
        sections={formSections}
        defaultValues={watchedValues}
        onSubmit={submit as any}
        onCancel={onCancel}
        submitText={isEditMode ? '✅ Actualizar Factura' : '✅ Crear Factura'}
        successMessage={{
          title: isEditMode ? 'INVOICE_UPDATED' : 'INVOICE_CREATED',
          description: `Factura ${isEditMode ? 'actualizada' : 'creada'} correctamente`
        }}
        resetOnSuccess={!isEditMode}
      />

      {/* Real-time Fiscal Analysis Panel */}
      {subtotal > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'var(--colors-blue-50)',
          borderRadius: '8px',
          border: '1px solid var(--colors-blue-200)'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--colors-blue-800)' }}>
            📊 Análisis Fiscal en Tiempo Real
          </h3>

          {/* Tax Calculations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                ${fiscalMetrics.taxableAmount}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Base Imponible</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'red' }}>
                ${fiscalMetrics.taxAmount}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>IVA ({taxPercentage}%)</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'blue' }}>
                ${fiscalMetrics.totalAmount}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: fiscalMetrics.complianceScore >= 75 ? 'green' : 'orange' }}>
                {fiscalMetrics.complianceScore}%
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Compliance</div>
            </div>
          </div>

          {/* Currency Conversion */}
          {watchedValues.currency !== 'ARS' && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--colors-orange-100)',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid var(--colors-orange-300)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--colors-orange-800)' }}>
                💱 Conversión de Moneda
              </div>
              <div style={{ fontSize: '13px', color: 'var(--colors-orange-700)' }}>
                {fiscalMetrics.totalAmount} {watchedValues.currency} × {exchangeRate} = ${fiscalMetrics.totalInARS} ARS
              </div>
            </div>
          )}

          {/* Cash Flow Impact */}
          {fiscalMetrics.cashFlowImpact.daysToCollection > 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--colors-purple-100)',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid var(--colors-purple-300)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--colors-purple-800)' }}>
                💰 Impacto en Flujo de Efectivo
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div>
                  <strong>Días a cobrar:</strong> {fiscalMetrics.cashFlowImpact.daysToCollection}
                </div>
                <div>
                  <strong>Valor descontado:</strong> ${fiscalMetrics.cashFlowImpact.discountedValue.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Compliance Warnings */}
          {fiscalMetrics.complianceScore < 100 && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--colors-red-100)',
              borderRadius: '6px',
              border: '1px solid var(--colors-red-300)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'var(--colors-red-800)' }}>
                ⚠️ Alertas de Cumplimiento
              </div>
              <ul style={{ fontSize: '12px', color: 'var(--colors-red-700)', margin: 0, paddingLeft: '16px' }}>
                {!watchedValues.customer_tax_id && <li>Falta CUIT/CUIL del cliente</li>}
                {!validateTaxCondition(watchedValues.customer_tax_condition, watchedValues.invoice_type) &&
                  <li>Condición fiscal incompatible con tipo de comprobante</li>}
                {!watchedValues.fiscal_point && <li>Punto de venta no especificado</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}