-- =====================================================
-- G-ADMIN MINI: RLS ENHANCEMENTS & IMPROVEMENTS - FIXED
-- Based on Supabase AI recommendations
-- =====================================================

-- =====================================================
-- 1. DETAILED LOGGING/AUDITING SYSTEM
-- =====================================================

-- Enhanced audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  action_type TEXT NOT NULL, -- 'access_granted', 'access_denied', 'role_check', 'rls_policy_triggered'
  resource_table TEXT,
  resource_id UUID,
  policy_name TEXT,
  access_level TEXT, -- 'read', 'write', 'delete', 'admin'
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  additional_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON public.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_success ON public.security_audit_log(success) WHERE success = false;

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type TEXT,
  p_resource_table TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_policy_name TEXT DEFAULT NULL,
  p_access_level TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_additional_context JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_session_id TEXT;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  v_user_email := COALESCE((auth.jwt() ->> 'email'), 'unknown');
  v_user_role := COALESCE(public.get_user_role(), 'unknown');
  v_session_id := COALESCE((auth.jwt() ->> 'session_id'), 'unknown');

  -- Insert audit log
  INSERT INTO public.security_audit_log (
    user_id, user_email, user_role, action_type, resource_table,
    resource_id, policy_name, access_level, session_id, success,
    error_message, additional_context
  ) VALUES (
    v_user_id, v_user_email, v_user_role, p_action_type, p_resource_table,
    p_resource_id, p_policy_name, p_access_level, v_session_id, p_success,
    p_error_message, p_additional_context
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    RAISE LOG 'Failed to log security event: %', SQLERRM;
END;
$$;

-- =====================================================
-- 2. ENHANCED UTILITY FUNCTIONS WITH BETTER ERROR HANDLING
-- =====================================================

-- Enhanced get_user_role with logging
CREATE OR REPLACE FUNCTION public.get_user_role_enhanced()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_value TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Return null if no authenticated user
    IF v_user_id IS NULL THEN
        PERFORM public.log_security_event('role_check', NULL, NULL, 'get_user_role_enhanced', 'read', false, 'No authenticated user');
        RETURN NULL;
    END IF;
    
    -- Try to get role from JWT custom claims first
    user_role_value := (auth.jwt() ->> 'user_role')::TEXT;
    
    -- If found in JWT, log and return
    IF user_role_value IS NOT NULL THEN
        PERFORM public.log_security_event('role_check', 'jwt_claims', v_user_id, 'get_user_role_enhanced', 'read', true, NULL, 
            jsonb_build_object('source', 'jwt', 'role', user_role_value));
        RETURN user_role_value;
    END IF;
    
    -- Fallback to users_roles table
    SELECT role::TEXT INTO user_role_value
    FROM public.users_roles 
    WHERE user_id = v_user_id 
      AND is_active = true
    LIMIT 1;
    
    -- Log the result
    IF user_role_value IS NOT NULL THEN
        PERFORM public.log_security_event('role_check', 'users_roles', v_user_id, 'get_user_role_enhanced', 'read', true, NULL,
            jsonb_build_object('source', 'database', 'role', user_role_value));
    ELSE
        PERFORM public.log_security_event('role_check', 'users_roles', v_user_id, 'get_user_role_enhanced', 'read', false, 'No role found',
            jsonb_build_object('source', 'database'));
    END IF;
    
    -- Default to CLIENTE if no role found
    RETURN COALESCE(user_role_value, 'CLIENTE');
    
EXCEPTION
    WHEN OTHERS THEN
        PERFORM public.log_security_event('role_check', 'users_roles', v_user_id, 'get_user_role_enhanced', 'read', false, SQLERRM);
        RETURN 'CLIENTE';
END;
$$;

-- Enhanced check_user_access with detailed logging
CREATE OR REPLACE FUNCTION public.check_user_access_enhanced(
  required_role TEXT DEFAULT 'CLIENTE',
  resource_table TEXT DEFAULT NULL,
  resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    current_role TEXT;
    has_access BOOLEAN;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Initialize variables
    has_access := false;
    current_role := public.get_user_role_enhanced();
    
    -- Check if user has required role or higher
    role_hierarchy := CASE current_role
        WHEN 'CLIENTE' THEN 1
        WHEN 'OPERADOR' THEN 2
        WHEN 'SUPERVISOR' THEN 3
        WHEN 'ADMINISTRADOR' THEN 4
        WHEN 'SUPER_ADMIN' THEN 5
        ELSE 0
    END;
    
    required_hierarchy := CASE required_role
        WHEN 'CLIENTE' THEN 1
        WHEN 'OPERADOR' THEN 2
        WHEN 'SUPERVISOR' THEN 3
        WHEN 'ADMINISTRADOR' THEN 4
        WHEN 'SUPER_ADMIN' THEN 5
        ELSE 0
    END;
    
    has_access := role_hierarchy >= required_hierarchy;
    
    -- Log access attempt
    PERFORM public.log_security_event(
        CASE WHEN has_access THEN 'access_granted' ELSE 'access_denied' END,
        resource_table,
        resource_id,
        'check_user_access_enhanced',
        'read',
        has_access,
        CASE WHEN NOT has_access THEN format('Insufficient role: %s < %s', current_role, required_role) ELSE NULL END,
        jsonb_build_object(
            'current_role', current_role,
            'required_role', required_role,
            'current_hierarchy', role_hierarchy,
            'required_hierarchy', required_hierarchy
        )
    );
    
    RETURN has_access;
    
EXCEPTION
    WHEN OTHERS THEN
        PERFORM public.log_security_event('access_denied', resource_table, resource_id, 'check_user_access_enhanced', 'read', false, SQLERRM);
        RETURN false;
END;
$$;

-- =====================================================
-- 3. PERIODIC ROLE REVIEW MECHANISMS
-- =====================================================

-- Role review schedule table
CREATE TABLE IF NOT EXISTS public.role_review_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_date TIMESTAMPTZ NOT NULL,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ NOT NULL,
  review_frequency_days INTEGER DEFAULT 90, -- 90 days default
  reviewer_user_id UUID REFERENCES auth.users(id),
  review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'requires_change'
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_role_review_schedule_next_review ON public.role_review_schedule(next_review_date);
CREATE INDEX IF NOT EXISTS idx_role_review_schedule_status ON public.role_review_schedule(review_status);

-- Function to identify roles needing review
CREATE OR REPLACE FUNCTION public.get_roles_needing_review()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  role TEXT,
  assigned_date TIMESTAMPTZ,
  days_overdue INTEGER,
  risk_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.user_id,
        u.email,
        ur.role::TEXT,
        ur.created_at,
        EXTRACT(days FROM (NOW() - rrs.next_review_date))::INTEGER as days_overdue,
        CASE 
            WHEN ur.role IN ('SUPER_ADMIN', 'ADMINISTRADOR') AND EXTRACT(days FROM (NOW() - rrs.next_review_date)) > 30 THEN 'HIGH'
            WHEN ur.role = 'SUPERVISOR' AND EXTRACT(days FROM (NOW() - rrs.next_review_date)) > 60 THEN 'MEDIUM'
            WHEN EXTRACT(days FROM (NOW() - rrs.next_review_date)) > 90 THEN 'LOW'
            ELSE 'NORMAL'
        END as risk_level
    FROM public.users_roles ur
    JOIN auth.users u ON ur.user_id = u.id
    LEFT JOIN public.role_review_schedule rrs ON ur.user_id = rrs.user_id
    WHERE ur.is_active = true
      AND (rrs.next_review_date IS NULL OR rrs.next_review_date <= NOW())
    ORDER BY 
        CASE 
            WHEN ur.role = 'SUPER_ADMIN' THEN 1
            WHEN ur.role = 'ADMINISTRADOR' THEN 2
            WHEN ur.role = 'SUPERVISOR' THEN 3
            ELSE 4
        END,
        rrs.next_review_date ASC NULLS FIRST;
END;
$$;

-- =====================================================
-- 4. ROLE MANAGEMENT INTERFACE FUNCTIONS
-- =====================================================

-- Function to safely change user role
CREATE OR REPLACE FUNCTION public.change_user_role(
  p_target_user_id UUID,
  p_new_role user_role,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_role TEXT;
  v_target_current_role TEXT;
  v_can_change BOOLEAN;
BEGIN
  -- Initialize variables
  v_can_change := false;
  v_current_user_role := public.get_user_role_enhanced();
  
  -- Get target user's current role
  SELECT role INTO v_target_current_role 
  FROM public.users_roles 
  WHERE user_id = p_target_user_id AND is_active = true;
  
  -- Check permissions
  CASE v_current_user_role
    WHEN 'SUPER_ADMIN' THEN
      v_can_change := true; -- Can change any role
    WHEN 'ADMINISTRADOR' THEN
      v_can_change := p_new_role NOT IN ('SUPER_ADMIN'); -- Cannot assign SUPER_ADMIN
    ELSE
      v_can_change := false; -- Others cannot change roles
  END CASE;
  
  IF NOT v_can_change THEN
    PERFORM public.log_security_event(
      'access_denied',
      'users_roles',
      p_target_user_id,
      'change_user_role',
      'admin',
      false,
      format('Insufficient permissions: %s cannot assign %s', v_current_user_role, p_new_role),
      jsonb_build_object('target_user', p_target_user_id, 'new_role', p_new_role, 'reason', p_reason)
    );
    RETURN false;
  END IF;
  
  -- Deactivate current role
  UPDATE public.users_roles 
  SET is_active = false, updated_at = NOW()
  WHERE user_id = p_target_user_id AND is_active = true;
  
  -- Insert new role
  INSERT INTO public.users_roles (user_id, role, assigned_by, is_active)
  VALUES (p_target_user_id, p_new_role, auth.uid(), true);
  
  -- Log the change
  PERFORM public.log_security_event(
    'role_changed',
    'users_roles',
    p_target_user_id,
    'change_user_role',
    'admin',
    true,
    NULL,
    jsonb_build_object(
      'old_role', v_target_current_role,
      'new_role', p_new_role,
      'reason', p_reason,
      'changed_by', auth.uid()
    )
  );
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.log_security_event(
      'role_change_failed',
      'users_roles',
      p_target_user_id,
      'change_user_role',
      'admin',
      false,
      SQLERRM
    );
    RETURN false;
END;
$$;

-- Function to get role management dashboard data
CREATE OR REPLACE FUNCTION public.get_role_management_dashboard()
RETURNS TABLE (
  total_users INTEGER,
  active_users INTEGER,
  inactive_users INTEGER,
  roles_needing_review INTEGER,
  high_risk_roles INTEGER,
  recent_role_changes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.users_roles) as total_users,
    (SELECT COUNT(*)::INTEGER FROM public.users_roles WHERE is_active = true) as active_users,
    (SELECT COUNT(*)::INTEGER FROM public.users_roles WHERE is_active = false) as inactive_users,
    (SELECT COUNT(*)::INTEGER FROM public.get_roles_needing_review()) as roles_needing_review,
    (SELECT COUNT(*)::INTEGER FROM public.get_roles_needing_review() WHERE risk_level = 'HIGH') as high_risk_roles,
    (SELECT COUNT(*)::INTEGER FROM public.security_audit_log 
     WHERE action_type = 'role_changed' AND created_at >= NOW() - INTERVAL '7 days') as recent_role_changes;
END;
$$;

-- =====================================================
-- 5. PERMISSIONS AND SECURITY
-- =====================================================

-- Grant permissions
GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT SELECT ON public.role_review_schedule TO authenticated;

GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_enhanced TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_user_access_enhanced TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_roles_needing_review TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_management_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_user_role TO authenticated;

-- RLS policies for audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_audit_log_read_policy" ON public.security_audit_log
  FOR SELECT USING (
    public.check_user_access_enhanced('SUPERVISOR') OR
    user_id = auth.uid()
  );

-- RLS policies for role review schedule
ALTER TABLE public.role_review_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_review_schedule_read_policy" ON public.role_review_schedule
  FOR SELECT USING (
    public.check_user_access_enhanced('SUPERVISOR') OR
    user_id = auth.uid()
  );

CREATE POLICY "role_review_schedule_manage_policy" ON public.role_review_schedule
  FOR ALL USING (public.check_user_access_enhanced('ADMINISTRADOR'));

-- =====================================================
-- 6. DOCUMENTATION AND COMMENTS
-- =====================================================

COMMENT ON TABLE public.security_audit_log IS 'Comprehensive audit log for all security-related events including RLS policy triggers';
COMMENT ON TABLE public.role_review_schedule IS 'Tracks periodic role reviews to ensure proper access control governance';

COMMENT ON FUNCTION public.log_security_event IS 'Logs security events with detailed context for audit trails';
COMMENT ON FUNCTION public.get_user_role_enhanced IS 'Enhanced version of get_user_role with comprehensive logging';
COMMENT ON FUNCTION public.check_user_access_enhanced IS 'Enhanced access control with detailed audit logging';
COMMENT ON FUNCTION public.get_roles_needing_review IS 'Identifies user roles that need periodic review based on risk level';
COMMENT ON FUNCTION public.change_user_role IS 'Safely changes user roles with proper authorization and audit logging';
COMMENT ON FUNCTION public.get_role_management_dashboard IS 'Provides dashboard metrics for role management oversight';

SELECT 'G-Admin Mini RLS Enhancements Fixed - successfully created!' as result;