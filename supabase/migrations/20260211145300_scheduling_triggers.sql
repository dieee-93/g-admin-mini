-- Migration: 20260211145300_scheduling_triggers.sql
-- Description: Implements backend triggers for appointment validation (overbooking and staff availability)

-- 1. Check for Overbooking
-- Prevents overlapping appointments for the same provider, excluding cancelled/no_show status.

CREATE OR REPLACE FUNCTION check_appointment_overbooking()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Check if there are any conflicting appointments
    -- We look for appointments with the same provider, same date, and overlapping time range.
    -- (StartA < EndB) and (EndA > StartB) is the standard overlap check.
    
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE provider_id = NEW.provider_id
      AND appointment_date = NEW.appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid) -- Exclude self
      AND (
          (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
      );

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Overbooking detected: Provider % has a conflicting appointment on % between % and %', 
            NEW.provider_id, NEW.appointment_date, NEW.start_time, NEW.end_time;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_appointment_overbooking ON appointments;

CREATE TRIGGER trigger_check_appointment_overbooking
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status NOT IN ('cancelled', 'no_show'))
    EXECUTE FUNCTION check_appointment_overbooking();


-- 2. Check Staff Availability
-- Ensures that the assigned provider has an active operational shift covers the appointment time.

CREATE OR REPLACE FUNCTION check_staff_availability()
RETURNS TRIGGER AS $$
DECLARE
    appt_start_ts TIMESTAMP WITH TIME ZONE;
    appt_end_ts TIMESTAMP WITH TIME ZONE;
    is_covered BOOLEAN;
BEGIN
    -- We need to combine date and time to compare with shift timestamps.
    -- Assuming appointment_date is 'YYYY-MM-DD' and start_time is 'HH:MM:SS'.
    -- We cast to timestamptz. Note: This relies on the server's timezone setting if not explicit.
    -- Ideally, we'd handle timezones more explicitly, but we'll assume consistent system usage for now.
    
    appt_start_ts := (NEW.appointment_date || ' ' || NEW.start_time)::timestamptz;
    appt_end_ts := (NEW.appointment_date || ' ' || NEW.end_time)::timestamptz;

    -- Check if a covering shift exists
    SELECT EXISTS (
        SELECT 1
        FROM operational_shifts
        WHERE employee_id = NEW.provider_id
          AND start_time <= appt_start_ts
          AND end_time >= appt_end_ts
          AND (status IS NULL OR status = 'active')
    ) INTO is_covered;

    IF NOT is_covered THEN
        RAISE EXCEPTION 'Staff unavailable: Provider % does not have a covering shift for % - %', 
            NEW.provider_id, appt_start_ts, appt_end_ts;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_staff_availability ON appointments;

CREATE TRIGGER trigger_check_staff_availability
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status NOT IN ('cancelled', 'no_show') AND NEW.provider_id IS NOT NULL)
    EXECUTE FUNCTION check_staff_availability();
