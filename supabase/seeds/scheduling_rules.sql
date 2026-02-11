-- Scheduling Alert Rules (Day 13)
-- These rules work alongside the database triggers to provide proactive alerts.

INSERT INTO public.universal_alert_rules (
    module_name,
    rule_name,
    organization_id,
    rule_type,
    severity,
    conditions,
    actions,
    is_active
) VALUES 
-- Rule 1: Unconfirmed appointment < 4 hours away (Warning)
(
    'scheduling',
    'Unconfirmed Upcoming Appointment',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'warning',
    jsonb_build_object(
        'logicalOperator', 'AND',
        'conditions', jsonb_build_array(
            jsonb_build_object(
                'field', 'confirmed',
                'operator', 'eq',
                'value', false
            ),
            jsonb_build_object(
                'field', 'status',
                'operator', 'eq',
                'value', 'pending'
            ),
            jsonb_build_object(
                'field', 'hours_until_start',
                'operator', 'lt',
                'value', 4
            )
        )
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app', 'email'),
        'recipient_roles', jsonb_build_array('admin', 'manager', 'receptionist'),
        'message_template', 'Cita de {customer_name} a las {start_time} sin confirmar. Llamar al cliente.'
    ),
    true
),

-- Rule 2: Overbooking Detected (Safety Net / Manual Override) (Critical)
-- Catches cases where trigger might have been bypassed or race conditions
(
    'scheduling',
    'Overbooking Detected',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'critical',
    jsonb_build_object(
        'field', 'is_conflicting',
        'operator', 'eq',
        'value', true
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app', 'email'),
        'recipient_roles', jsonb_build_array('admin', 'manager'),
        'message_template', 'CRÍTICO: Overbooking detectado para {provider_name} a las {start_time}. Resolver inmediatamente.'
    ),
    true
),

-- Rule 3: Staff Unavailable with Active Appointments (Orphaned Booking) (Critical)
-- Catches cases where a shift was deleted/modified AFTER appointments were made
(
    'scheduling',
    'Staff Unavailable for Appointment',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'critical',
    jsonb_build_object(
        'logicalOperator', 'AND',
        'conditions', jsonb_build_array(
            jsonb_build_object(
                'field', 'staff_has_shift',
                'operator', 'eq',
                'value', false
            ),
            jsonb_build_object(
                'field', 'status',
                'operator', 'in',
                'value', jsonb_build_array('confirmed', 'pending')
            )
        )
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app', 'email'),
        'recipient_roles', jsonb_build_array('admin', 'manager'),
        'message_template', 'URGENTE: {provider_name} no tiene turno asignado para la cita de {customer_name} ({start_time}).'
    ),
    true
);
