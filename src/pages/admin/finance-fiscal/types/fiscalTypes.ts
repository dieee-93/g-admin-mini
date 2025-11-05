// Fiscal Module Types - Argentine Tax Compliance & AFIP Integration
// Based on architecture-plan.md requirements

export interface AFIPConfiguration {
  id?: string;
  location_id: string;                     // 🆕 REQUIRED for multi-location
  location_name?: string;                  // 🆕 For display
  cuit: string;                            // Same CUIT for all locations (standard practice)
  certificate_path: string;
  private_key_path: string;
  environment: 'testing' | 'production';
  punto_venta: number;                     // 🔄 UPDATED: Matches location.punto_venta_afip
  ultimo_comprobante?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  location_id: string;                     // 🆕 REQUIRED: Location where invoice was issued
  numero: number;                          // 🔄 UPDATED: Correlative per (location_id, punto_venta, tipo_comprobante)
  punto_venta: number;                     // 🔄 UPDATED: Per location (matches location.punto_venta_afip)
  tipo_comprobante: InvoiceType;
  fecha_emision: string;
  cuit_cliente?: string;
  denominacion_cliente: string;
  condicion_iva_cliente: CondicionIVA;
  domicilio_cliente?: string;

  // Amounts
  subtotal: number;
  iva_105: number;
  iva_21: number;
  percepciones: number;
  retenciones: number;
  total: number;

  // AFIP Response (using DB column names)
  afip_cae?: string;                       // 🔄 FIXED: DB uses afip_cae (not cae)
  afip_cae_due_date?: string;              // 🔄 FIXED: DB uses afip_cae_due_date (not cae_vencimiento)
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue'; // 🔄 FIXED: DB uses status (not resultado)
  observaciones?: string[];

  // Items
  items: InvoiceItem[];

  // Relations
  sale_id?: string;

  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  codigo?: string;
  descripcion: string;
  cantidad: number;
  unidad_medida: UnidadMedida;
  precio_unitario: number;
  bonificacion: number;
  alicuota_iva: AlicuotaIVA;
  importe_iva: number;
  importe_neto: number;
}

export interface TaxReport {
  id: string;
  location_id?: string;                    // 🆕 NULL = consolidated report (all locations)
  is_consolidated: boolean;                // 🆕 TRUE = report includes all locations
  periodo: string; // YYYY-MM
  tipo: 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias';

  // IVA Ventas
  ventas_netas?: number;
  iva_debito_fiscal?: number;

  // IVA Compras
  compras_netas?: number;
  iva_credito_fiscal?: number;

  // Balance
  saldo_a_favor?: number;
  saldo_a_pagar?: number;

  // Status
  presentado: boolean;
  fecha_presentacion?: string;

  created_at: string;
}

export interface FinancialReport {
  id: string;
  location_id?: string;                    // 🆕 NULL = consolidated report (all locations)
  is_consolidated: boolean;                // 🆕 TRUE = report includes all locations
  tipo: 'profit_loss' | 'balance' | 'cash_flow' | 'tax_summary';
  periodo_inicio: string;
  periodo_fin: string;
  
  // P&L Data
  ingresos?: {
    ventas_netas: number;
    otros_ingresos: number;
    total: number;
  };
  
  egresos?: {
    costo_ventas: number;
    gastos_operativos: number;
    gastos_administrativos: number;
    impuestos: number;
    total: number;
  };
  
  resultado?: {
    bruto: number;
    operativo: number;
    neto: number;
    margen_bruto: number;
    margen_operativo: number;
  };
  
  // Balance Data
  activos?: {
    corrientes: number;
    no_corrientes: number;
    total: number;
  };
  
  pasivos?: {
    corrientes: number;
    no_corrientes: number;
    total: number;
  };
  
  patrimonio?: {
    capital: number;
    resultados_acumulados: number;
    resultado_ejercicio: number;
    total: number;
  };
  
  // Tax Summary
  resumen_impuestos?: {
    iva_a_pagar: number;
    ingresos_brutos: number;
    ganancias: number;
    percepciones_sufridas: number;
    retenciones_sufridas: number;
    total_obligaciones: number;
  };
  
  generated_at: string;
  generated_by: string;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  forma_pago: FormaPago;
  importe: number;
  fecha_pago: string;
  referencia?: string; // Transaction ID, check number, etc.
  banco?: string;
  cuenta?: string;
  estado: 'pendiente' | 'confirmado' | 'rechazado' | 'conciliado';
  conciliado_at?: string;
  created_at: string;
}

// Enums for AFIP compliance
export enum InvoiceType {
  FACTURA_A = '001',
  FACTURA_B = '006', 
  FACTURA_C = '011',
  FACTURA_E = '019',
  NOTA_CREDITO_A = '002',
  NOTA_CREDITO_B = '007',
  NOTA_CREDITO_C = '012',
  NOTA_DEBITO_A = '003',
  NOTA_DEBITO_B = '008',
  NOTA_DEBITO_C = '013'
}

export enum CondicionIVA {
  RESPONSABLE_INSCRIPTO = '01',
  EXENTO = '02',
  CONSUMIDOR_FINAL = '05',
  RESPONSABLE_MONOTRIBUTO = '06',
  SUJETO_NO_CATEGORIZADO = '07'
}

export enum AlicuotaIVA {
  EXENTO = '003',
  IVA_105 = '004',
  IVA_21 = '005'
}

export enum UnidadMedida {
  UNIDADES = '07',
  KILOGRAMOS = '03',
  LITROS = '05',
  METROS = '02',
  HORAS = '06'
}

export enum FormaPago {
  EFECTIVO = '01',
  TARJETA_DEBITO = '02',
  TARJETA_CREDITO = '03',
  TRANSFERENCIA = '04',
  CHEQUE = '05',
  MERCADO_PAGO = '99'
}

export interface FiscalStats {
  location_id?: string;                    // 🆕 NULL = consolidated stats
  facturacion_mes_actual: number;
  iva_a_pagar_mes: number;
  ingresos_brutos_mes: number;
  facturas_emitidas_mes: number;
  cae_pendientes: number;
  observaciones_pendientes: number;
  ultimo_respaldo: string;
  proxima_presentacion: string;
}

// 🆕 NEW: Fiscal page state for UI controls
export interface FiscalPageState {
  fiscalMode: 'per-location' | 'consolidated';
  setFiscalMode: (mode: 'per-location' | 'consolidated') => void;
  selectedLocation?: Location | null;
  isMultiLocationMode: boolean;
  afipConfig?: AFIPConfiguration;
}

// 🆕 NEW: Helper type for Location (imported from @/types/location)
import type { Location } from '@/types/location';

// Event types for event-driven architecture
export interface FiscalEvents {
  INVOICE_GENERATED: {
    invoice_id: string;
    location_id: string;                   // 🆕 Location where invoice was generated
    sale_id: string;
    total: number;
    tipo_comprobante: InvoiceType;
    punto_venta: number;                   // 🆕 PDV used
  };

  CAE_OBTAINED: {
    invoice_id: string;
    location_id: string;                   // 🆕 Location of the invoice
    afip_cae: string;                      // 🔄 FIXED: DB uses afip_cae
    afip_cae_due_date: string;             // 🔄 FIXED: DB uses afip_cae_due_date
    punto_venta: number;                   // 🆕 PDV used
  };

  CAE_REJECTED: {
    invoice_id: string;
    location_id: string;                   // 🆕 Location of the invoice
    observaciones: string[];
    retry_count: number;
    punto_venta: number;                   // 🆕 PDV used
  };

  PAYMENT_PROCESSED: {
    payment_id: string;
    invoice_id: string;
    location_id?: string;                  // 🆕 Optional: Location where payment was processed
    amount: number;
    forma_pago: FormaPago;
  };

  TAX_PERIOD_CLOSED: {
    periodo: string;
    location_id?: string;                  // 🆕 NULL = consolidated period closing
    tipo: string;
    amount_due: number;
  };
}
// Additional types for invoice and CAE operations
export interface InvoiceGenerationData {
  sale_id?: string;
  customer_id: string;
  customer_name: string;
  customer_cuit?: string;
  customer_address?: string;
  tipo_comprobante: InvoiceType;
  condicion_iva: CondicionIVA;
  items: InvoiceItem[];
  payment_method?: FormaPago;
  notes?: string;
  location_id?: string;
}

export interface CAERequestData {
  invoice_id: string;
  location_id: string;
  punto_venta: number;
  tipo_comprobante: InvoiceType;
  numero: number;
  fecha_emision: string;
  cuit_cliente?: string;
  condicion_iva_cliente: CondicionIVA;
  subtotal: number;
  iva_amount: number;
  total: number;
  items: InvoiceItem[];
}

// Icon type for components (HeroIcons v2)
export type HeroIcon = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

// ============================================================================
// ALERT SYSTEM TYPES
// ============================================================================

export interface FiscalAlert {
  type: 'connection' | 'cae' | 'compliance' | 'queue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}

// ============================================================================
// CHART & ANALYTICS TYPES
// ============================================================================

export interface ChartDataPoint {
  month?: string;
  label?: string;
  value: number;
  category?: string;
  [key: string]: string | number | undefined;
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

// ============================================================================
// INVOICE FORM TYPES
// ============================================================================

export interface InvoiceFormData extends InvoiceGenerationData {
  // Additional form-specific fields
  documentNumber?: string;
  fiscalAddress?: string;
  observations?: string;
}

// ============================================================================
// AFIP API RESPONSE TYPES
// ============================================================================

export interface AFIPStatusResponse {
  connection: 'connected' | 'disconnected' | 'error';
  service_status: 'active' | 'inactive' | 'maintenance';
  token_expiry: string;
  certificate_valid: boolean;
  last_sync: string;
  pending_requests: number;
  failed_requests: number;
}

export interface CAEResponse {
  success: boolean;
  cae?: string;
  cae_due_date?: string;
  result: 'A' | 'R' | 'P'; // Approved, Rejected, Partial
  observations?: string[];
  errors?: string[];
}

export interface InvoiceListItem {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name?: string;
  invoice_type: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  afip_cae?: string;
  created_at: string;
}

export interface ComplianceReportData {
  periodo: string;
  invoices_count: number;
  total_billed: number;
  cae_success_rate: number;
  pending_cae: number;
  compliance_score: number;
  tax_summary: {
    iva_collected: number;
    ingresos_brutos: number;
    total_taxes: number;
  };
}

export interface AFIPInvoiceRequest {
  punto_venta: number;
  tipo_comprobante: string;
  numero: number;
  fecha_emision: string;
  cuit_cliente?: string;
  condicion_iva_cliente: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  items: InvoiceItem[];
}
