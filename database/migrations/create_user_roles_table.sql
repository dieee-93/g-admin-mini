-- Create user role enum
CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');

-- Create users_roles table
CREATE TABLE IF NOT EXISTS public.users_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLIENTE',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_roles_user_id ON public.users_roles(user_id);
CREATE INDEX idx_users_roles_active ON public.users_roles(user_id, is_active);

-- Ensure one active role per user (partial unique index)
CREATE UNIQUE INDEX idx_users_roles_unique_active 
ON public.users_roles(user_id) 
WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own role
CREATE POLICY "users_can_read_own_role" ON public.users_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only SUPER_ADMIN can manage roles
CREATE POLICY "super_admin_can_manage_roles" ON public.users_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'SUPER_ADMIN'
      AND ur.is_active = TRUE
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_users_roles_updated_at_trigger
    BEFORE UPDATE ON public.users_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_users_roles_updated_at();

-- Function to assign role to new users
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign CLIENTE role to new users
    INSERT INTO public.users_roles (user_id, role)
    VALUES (NEW.id, 'CLIENTE');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign role to new users
CREATE TRIGGER assign_default_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_role();

-- Grant permissions
GRANT SELECT ON public.users_roles TO authenticated;
GRANT INSERT, UPDATE ON public.users_roles TO service_role;

-- Add comment
COMMENT ON TABLE public.users_roles IS 'User role assignments for G-Mini access control';
COMMENT ON COLUMN public.users_roles.role IS 'User role: CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, or SUPER_ADMIN';
COMMENT ON COLUMN public.users_roles.is_active IS 'Only one active role per user allowed';