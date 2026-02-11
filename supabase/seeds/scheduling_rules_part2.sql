-- Scheduling Alert Rules (Day 14 - Part 2)
-- Remaining 3 rules for customer reliability and system integrity.

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
-- Rule 4: High No-Show Rate Customer (Info)
-- Warns staff if the customer has a history of missing appointments (>20%)
(
    'scheduling',
    'High No-Show Rate Customer',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'info',
    jsonb_build_object(
        'field', 'customer_no_show_rate',
        'operator', 'gt',
        'value', 0.20
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app'),
        'recipient_roles', jsonb_build_array('admin', 'manager', 'receptionist'),
        'message_template', 'Atención: El cliente {customer_name} tiene una tasa de inasistencia del {customer_no_show_rate_percent}%. Considerar solicitar seña.'
    ),
    true
),

-- Rule 5: Reminder Not Sent (Warning)
-- Detects if an appointment is tomorrow but no reminder has been sent yet
(
    'scheduling',
    'Appointment Reminder Not Sent',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'warning',
    jsonb_build_object(
        'logicalOperator', 'AND',
        'conditions', jsonb_build_array(
            jsonb_build_object(
                'field', 'hours_until_start',
                'operator', 'lt',
                'value', 24
            ),
            jsonb_build_object(
                'field', 'reminder_sent',
                'operator', 'eq',
                'value', false
            ),
            jsonb_build_object(
                'field', 'status',
                'operator', 'eq',
                'value', 'confirmed'
            )
        )
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app', 'email'),
        'recipient_roles', jsonb_build_array('admin', 'manager'),
        'message_template', 'Alerta: No se ha enviado recordatorio para la cita de {customer_name} mañana a las {start_time}.'
    ),
    true
),

-- Rule 6: General Time Conflict (Error)
-- Fallback rule for any other conflict flag detected
(
    'scheduling',
    'General Time Conflict',
    '00000000-0000-0000-0000-000000000001',
    'threshold',
    'critical',
    jsonb_build_object(
        'field', 'time_conflict',
        'operator', 'eq',
        'value', true
    ),
    jsonb_build_object(
        'channels', jsonb_build_array('in_app', 'email'),
        'recipient_roles', jsonb_build_array('admin', 'manager'),
        'message_template', 'Error de Agenda: Conflicto de horario detectado para {resource_name}. Revisar inmediatamente.'
    ),
    true
);
