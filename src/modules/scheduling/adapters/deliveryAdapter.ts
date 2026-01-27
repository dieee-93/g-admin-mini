/**
 * DELIVERY ADAPTER
 *
 * Convierte datos de deliveries/entregas al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#deliveries
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, DeliveryMetadata } from '../types/calendar';

/**
 * Delivery type
 *
 * Representa una entrega programada en el sistema.
 * Compatible con tabla deliveries en Supabase.
 */
export interface Delivery {
  id: string;
  orderId: string;
  deliveryAddress: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  deliveryZone?: string;
  distanceKm?: number;
  estimatedTimeMinutes?: number;
  trackingUrl?: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adapter para Deliveries
 *
 * Convierte datos de entregas programadas a UnifiedScheduleEvent
 */
export class DeliveryAdapter extends SchedulingAdapter<Delivery> {
  /**
   * Convierte un Delivery a UnifiedScheduleEvent
   *
   * @param delivery - Datos del delivery
   * @returns Evento unificado
   */
  adapt(delivery: Delivery): UnifiedScheduleEvent {
    // Combinar fecha + hora de inicio/fin
    const start = this.combineDateTime(delivery.scheduledDate, delivery.scheduledStartTime);
    const end = this.combineDateTime(delivery.scheduledDate, delivery.scheduledEndTime);

    // Validar fechas
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('delivery');

    // Construir metadata específica
    const metadata: DeliveryMetadata = {
      type: 'delivery',
      orderId: delivery.orderId,
      deliveryAddress: delivery.deliveryAddress,
      driverId: delivery.driverId,
      driverName: delivery.driverName,
      vehicleId: delivery.vehicleId,
      deliveryZone: delivery.deliveryZone,
      distanceKm: delivery.distanceKm,
      estimatedTimeMinutes: delivery.estimatedTimeMinutes,
      trackingUrl: delivery.trackingUrl
    };

    // Generar título descriptivo
    const title = delivery.driverName
      ? `${delivery.driverName} - Entrega (${delivery.deliveryZone || 'Zona'})`
      : `Entrega - ${delivery.orderId.substring(0, 8)}`;

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: delivery.id,
      type: 'delivery',

      // Información básica
      title,
      description: `Entrega a ${delivery.deliveryAddress}`,

      // Temporal
      start,
      end,
      allDay: false,

      // Relaciones
      employeeId: delivery.driverId,
      employeeName: delivery.driverName,
      departmentId: 'logistics',
      departmentName: 'Logística',
      locationId: undefined,

      // Estado
      status: this.normalizeStatus(delivery.status),
      priority: this.calculateDeliveryPriority(delivery),

      // Metadata
      metadata,

      // UI
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'TruckIcon', // Heroicons

      // Audit
      createdAt: new Date(delivery.createdAt),
      updatedAt: new Date(delivery.updatedAt),
      createdBy: undefined
    };

    return event;
  }

  /**
   * Calcula prioridad basada en tiempo estimado y distancia
   *
   * @param delivery - Datos del delivery
   * @returns Prioridad (1=baja, 2=media, 3=alta)
   */
  private calculateDeliveryPriority(delivery: Delivery): 1 | 2 | 3 {
    // Alta prioridad si es entrega urgente (< 30 min)
    if (delivery.estimatedTimeMinutes && delivery.estimatedTimeMinutes < 30) {
      return 3;
    }

    // Media prioridad si es distancia larga (> 10 km)
    if (delivery.distanceKm && delivery.distanceKm > 10) {
      return 2;
    }

    // Baja prioridad por defecto
    return 1;
  }

  /**
   * Convierte deliveries filtradas por zona
   *
   * @param deliveries - Array de deliveries
   * @param zone - Zona de entrega
   * @returns Array de eventos unificados
   */
  adaptByZone(deliveries: Delivery[], zone: string): UnifiedScheduleEvent[] {
    const filtered = deliveries.filter(d => d.deliveryZone === zone);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte deliveries de un driver específico
   *
   * @param deliveries - Array de deliveries
   * @param driverId - ID del repartidor
   * @returns Array de eventos unificados
   */
  adaptByDriver(deliveries: Delivery[], driverId: string): UnifiedScheduleEvent[] {
    const filtered = deliveries.filter(d => d.driverId === driverId);
    return this.adaptMany(filtered);
  }
}

// Singleton instance
export const deliveryAdapter = new DeliveryAdapter();
