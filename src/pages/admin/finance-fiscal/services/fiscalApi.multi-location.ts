// ================================================================
// FISCAL API - MULTI-LOCATION SUPPORT
// ================================================================
// Purpose: Location-aware fiscal operations for AFIP compliance
// Key Changes:
// - getNextInvoiceNumber now requires location_id + punto_venta
// - createInvoice requires location_id
// - getAFIPConfiguration per location
// - Consolidated vs per-location stats
// ================================================================

import { supabase } from '@/lib/supabase/client';
import { locationsApi } from '@/services/locationsApi';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';
import {
  type Invoice,
  type AFIPConfiguration,
  type TaxReport,
  type FinancialReport,
  type FiscalStats,
  InvoiceType,
  CondicionIVA
} from '../types/fiscalTypes';

class FiscalAPIMultiLocation {
  // ================================================================
  // INVOICE MANAGEMENT - MULTI-LOCATION
  // ================================================================

  /**
   * Get invoices filtered by location
   * @param locationId - Location ID or null for all locations
   * @param limit - Number of invoices to fetch
   */
  async getInvoices(locationId: string | null, limit: number = 50): Promise<Invoice[]> {
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by location if specified
      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('FiscalAPI', 'Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get next invoice number for a specific location + PDV + tipo_comprobante
   * CRITICAL: Each location has independent numbering per PDV and tipo_comprobante
   * @param locationId - Location ID
   * @param puntoVenta - PDV number (from location.punto_venta_afip)
   * @param tipoComprobante - Invoice type (A, B, C, E)
   */
  async getNextInvoiceNumber(
    locationId: string,
    puntoVenta: number,
    tipoComprobante: InvoiceType
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('numero')
        .eq('location_id', locationId)
        .eq('punto_venta', puntoVenta)
        .eq('tipo_comprobante', tipoComprobante)
        .order('numero', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data && data.length > 0
        ? DecimalUtils.add(data[0].numero.toString(), '1', 'financial').toNumber()
        : 1;
    } catch (error) {
      logger.error('FiscalAPI', 'Error getting next invoice number:', error);
      throw error;
    }
  }

  /**
   * Create invoice with location context
   * @param invoiceData - Invoice data
   * @param locationId - Location ID where invoice is being created
   */
  async createInvoice(invoiceData: Partial<Invoice>, locationId: string): Promise<Invoice> {
    try {
      // Get AFIP config for this location
      const afipConfig = await this.getAFIPConfiguration(locationId);

      // Get next invoice number for this location + PDV + tipo
      const nextNumber = await this.getNextInvoiceNumber(
        locationId,
        afipConfig.punto_venta,
        invoiceData.tipo_comprobante!
      );

      const invoice: Partial<Invoice> = {
        ...invoiceData,
        location_id: locationId,
        numero: nextNumber,
        punto_venta: afipConfig.punto_venta,
        fecha_emision: new Date().toISOString(),
        resultado: 'P', // Pendiente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();

      if (error) throw error;

      // Emit event with location context
      // eventBus.emit('fiscal.invoice.generated', {
      //   invoice_id: data.id,
      //   location_id: locationId,
      //   sale_id: data.sale_id,
      //   total: data.total,
      //   tipo_comprobante: data.tipo_comprobante,
      //   punto_venta: data.punto_venta
      // });

      return data;
    } catch (error) {
      logger.error('FiscalAPI', 'Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Request CAE from AFIP for a specific invoice
   * @param invoiceId - Invoice ID
   * @param puntoVenta - PDV number to use in AFIP request
   */
  async requestCAE(invoiceId: string, puntoVenta: number): Promise<string> {
    try {
      // TODO: Integrate with AFIP Web Service
      // For now, simulate the process
      const afip_cae = this.generateMockCAE();
      const afip_cae_due_date = this.getCAEExpiration();

      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',                        // 🔄 FIXED: Use status (not resultado)
          afip_cae: afip_cae,                    // 🔄 FIXED: Use afip_cae (not cae)
          afip_cae_due_date: afip_cae_due_date,  // 🔄 FIXED: Use afip_cae_due_date (not cae_vencimiento)
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      // TODO: Emit event
      // eventBus.emit('fiscal.cae.obtained', {
      //   invoice_id: invoiceId,
      //   location_id: invoice.location_id,
      //   afip_cae,
      //   afip_cae_due_date,
      //   punto_venta: puntoVenta
      // });

      return afip_cae;
    } catch (error) {
      logger.error('FiscalAPI', 'Error requesting CAE:', error);
      throw error;
    }
  }

  // ================================================================
  // AFIP CONFIGURATION - MULTI-LOCATION
  // ================================================================

  /**
   * Get AFIP configuration for a specific location
   * @param locationId - Location ID
   */
  async getAFIPConfiguration(locationId: string): Promise<AFIPConfiguration> {
    try {
      const { data, error } = await supabase
        .from('afip_configuration')
        .select(`
          *,
          location:locations(name, code, punto_venta_afip)
        `)
        .eq('location_id', locationId)
        .single();

      if (error) {
        throw new Error(`No AFIP configuration found for location ${locationId}`);
      }

      return {
        ...data,
        location_name: data.location?.name,
        punto_venta: data.location?.punto_venta_afip || data.punto_venta,
      } as AFIPConfiguration;
    } catch (error) {
      logger.error('FiscalAPI', 'Error fetching AFIP configuration:', error);
      throw error;
    }
  }

  /**
   * Get all AFIP configurations (for multi-location setup)
   */
  async getAllAFIPConfigurations(): Promise<AFIPConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('afip_configuration')
        .select(`
          *,
          location:locations(name, code, punto_venta_afip)
        `)
        .order('location_id');

      if (error) throw error;

      return (data || []).map(config => ({
        ...config,
        location_name: config.location?.name,
        punto_venta: config.location?.punto_venta_afip || config.punto_venta,
      })) as AFIPConfiguration[];
    } catch (error) {
      logger.error('FiscalAPI', 'Error fetching all AFIP configurations:', error);
      throw error;
    }
  }

  /**
   * Create or update AFIP configuration for a location
   */
  async upsertAFIPConfiguration(
    locationId: string,
    config: Partial<AFIPConfiguration>
  ): Promise<AFIPConfiguration> {
    try {
      const { data, error } = await supabase
        .from('afip_configuration')
        .upsert({
          ...config,
          location_id: locationId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as AFIPConfiguration;
    } catch (error) {
      logger.error('FiscalAPI', 'Error upserting AFIP configuration:', error);
      throw error;
    }
  }

  // ================================================================
  // FISCAL STATS - MULTI-LOCATION
  // ================================================================

  /**
   * Get fiscal stats by location or consolidated
   * @param locationId - Location ID or null for consolidated stats
   * @param startDate - Start date for period
   * @param endDate - End date for period
   */
  async getFiscalStats(
    locationId: string | null,
    startDate: string,
    endDate: string
  ): Promise<FiscalStats> {
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .gte('fecha_emision', startDate)
        .lte('fecha_emision', endDate);

      // Filter by location if specified
      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const invoices = data || [];

      // Calculate stats
      const facturacion_mes_actual = invoices.reduce(
        (sum, inv) => DecimalUtils.add(sum.toString(), inv.total.toString(), 'financial').toNumber(),
        0
      );

      const iva_a_pagar_mes = invoices.reduce(
        (sum, inv) => DecimalUtils.add(
          sum.toString(),
          DecimalUtils.add(inv.iva_105?.toString() || '0', inv.iva_21?.toString() || '0', 'financial').toString(),
          'financial'
        ).toNumber(),
        0
      );

      const cae_pendientes = invoices.filter(inv => inv.resultado === 'P').length;
      const observaciones_pendientes = invoices.filter(
        inv => inv.observaciones && inv.observaciones.length > 0
      ).length;

      return {
        location_id: locationId || undefined,
        facturacion_mes_actual,
        iva_a_pagar_mes,
        ingresos_brutos_mes: facturacion_mes_actual * 0.03, // 3% estimate
        facturas_emitidas_mes: invoices.length,
        cae_pendientes,
        observaciones_pendientes,
        ultimo_respaldo: new Date().toISOString(),
        proxima_presentacion: this.getNextTaxDeadline()
      };
    } catch (error) {
      logger.error('FiscalAPI', 'Error getting fiscal stats:', error);
      throw error;
    }
  }

  // ================================================================
  // TAX REPORTS - MULTI-LOCATION
  // ================================================================

  /**
   * Generate consolidated tax report (all locations)
   */
  async generateConsolidatedTaxReport(
    reportType: 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias',
    year: number,
    month: number
  ): Promise<TaxReport> {
    try {
      // Get all locations
      const locations = await locationsApi.getAll();

      // Aggregate invoices from all locations
      const allInvoices: Invoice[] = [];
      for (const location of locations) {
        const invoices = await this.getInvoicesByLocationAndPeriod(
          location.id,
          year,
          month
        );
        allInvoices.push(...invoices);
      }

      // Calculate consolidated report data
      const reportData = this.calculateTaxReportData(allInvoices, reportType);

      // Save to database
      const { data, error } = await supabase
        .from('tax_reports')
        .insert({
          location_id: null, // NULL indicates consolidated
          is_consolidated: true,
          periodo: `${year}-${String(month).padStart(2, '0')}`,
          tipo: reportType,
          ...reportData,
          presentado: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as TaxReport;
    } catch (error) {
      logger.error('FiscalAPI', 'Error generating consolidated tax report:', error);
      throw error;
    }
  }

  /**
   * Generate tax report for specific location
   */
  async generateLocationTaxReport(
    locationId: string,
    reportType: 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias',
    year: number,
    month: number
  ): Promise<TaxReport> {
    try {
      const invoices = await this.getInvoicesByLocationAndPeriod(locationId, year, month);
      const reportData = this.calculateTaxReportData(invoices, reportType);

      const { data, error } = await supabase
        .from('tax_reports')
        .insert({
          location_id: locationId,
          is_consolidated: false,
          periodo: `${year}-${String(month).padStart(2, '0')}`,
          tipo: reportType,
          ...reportData,
          presentado: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as TaxReport;
    } catch (error) {
      logger.error('FiscalAPI', 'Error generating location tax report:', error);
      throw error;
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private async getInvoicesByLocationAndPeriod(
    locationId: string,
    year: number,
    month: number
  ): Promise<Invoice[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${this.getLastDayOfMonth(year, month)}`;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('location_id', locationId)
      .gte('fecha_emision', startDate)
      .lte('fecha_emision', endDate);

    if (error) throw error;
    return data || [];
  }

  private calculateTaxReportData(
    invoices: Invoice[],
    reportType: string
  ): Partial<TaxReport> {
    const ventas_netas = invoices.reduce(
      (sum, inv) => DecimalUtils.add(sum.toString(), inv.subtotal.toString(), 'financial').toNumber(),
      0
    );

    const iva_debito_fiscal = invoices.reduce(
      (sum, inv) => DecimalUtils.add(
        sum.toString(),
        DecimalUtils.add(inv.iva_105?.toString() || '0', inv.iva_21?.toString() || '0', 'financial').toString(),
        'financial'
      ).toNumber(),
      0
    );

    return {
      ventas_netas,
      iva_debito_fiscal,
      compras_netas: 0, // TODO: Implement
      iva_credito_fiscal: 0, // TODO: Implement
      saldo_a_pagar: iva_debito_fiscal
    };
  }

  private generateMockCAE(): string {
    return Math.floor(Math.random() * 90000000000000 + 10000000000000).toString();
  }

  private getCAEExpiration(): string {
    const date = new Date();
    date.setDate(date.getDate() + 10); // CAE válido por 10 días
    return date.toISOString().split('T')[0];
  }

  private getNextTaxDeadline(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(20); // Vencimiento día 20 del mes siguiente
    return date.toISOString().split('T')[0];
  }

  private getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Sync pending CAEs for a specific location
   */
  async syncLocationPendingCAE(locationId: string): Promise<number> {
    try {
      const { data: pendingInvoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('location_id', locationId)
        .eq('status', 'draft')              // 🔄 FIXED: Use status (not resultado)
        .is('afip_cae', null);              // 🔄 FIXED: Check afip_cae IS NULL

      if (error) throw error;

      let syncedCount = 0;
      for (const invoice of pendingInvoices || []) {
        try {
          await this.requestCAE(invoice.id, invoice.punto_venta);
          syncedCount++;
        } catch (error) {
          logger.error('FiscalAPI', `Error syncing CAE for invoice ${invoice.id}:`, error);
        }
      }

      return syncedCount;
    } catch (error) {
      logger.error('FiscalAPI', 'Error syncing location pending CAE:', error);
      throw error;
    }
  }

  /**
   * Sync pending CAEs for all locations
   */
  async syncAllLocationsPendingCAE(): Promise<{ [locationId: string]: number }> {
    try {
      const locations = await locationsApi.getAll();
      const results: { [locationId: string]: number } = {};

      for (const location of locations) {
        results[location.id] = await this.syncLocationPendingCAE(location.id);
      }

      return results;
    } catch (error) {
      logger.error('FiscalAPI', 'Error syncing all locations pending CAE:', error);
      throw error;
    }
  }
}

export const fiscalApiMultiLocation = new FiscalAPIMultiLocation();
