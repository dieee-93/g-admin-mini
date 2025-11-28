[
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.afip_configurations\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage AFIP configs\",\"Supervisors can view AFIP configs\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "afip_configurations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_afip_configurations_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.billing_cycles\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage billing cycles\",\"Users can view billing cycles\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "billing_cycles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_billing_cycles_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.business_profiles\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{business_profiles_admin_access,business_profiles_read_authenticated}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "business_profiles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_business_profiles_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.carts\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all carts\",\"Users can manage their own carts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "carts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_carts_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalog_products\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalog products\",\"Catalog products are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalog_products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalog_products_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalogs\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalogs\",\"Catalogs are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalogs",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalogs_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.customer_packages\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{customer_packages_manage_staff,customer_packages_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "customer_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_customer_packages_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.deliveries\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage deliveries\",\"Users can view deliveries\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "deliveries",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_deliveries_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_assignments\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{delivery_assignments_driver_policy,delivery_assignments_manage_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_assignments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_assignments_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access,employees_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.integrations\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Only admins can manage integrations\",\"Only admins can read integrations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "integrations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_integrations_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.maintenance_schedules\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage maintenance schedules\",\"Users can view maintenance schedules\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "maintenance_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_maintenance_schedules_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.member_benefits\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active benefits\",\"Staff can manage benefits\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "member_benefits",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_member_benefits_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_tiers\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active membership tiers\",\"Staff can manage membership tiers\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_tiers",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_tiers_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_usage\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage membership usage\",\"Users can view their membership usage\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_usage",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_usage_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.memberships\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all memberships\",\"Users can view their own membership\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "memberships",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_memberships_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{orders_admin_full_access,orders_operator_read,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role,payment_methods_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payments\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payments\",\"Users can view their payments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payments_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.provider_availability\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{provider_availability_manage,provider_availability_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "provider_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_provider_availability_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_items\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active rental items\",\"Staff can manage rental items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_items_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_reservations\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all reservations\",\"Users can view their own reservations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_reservations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_reservations_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.role_review_schedule\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{role_review_schedule_manage_policy,role_review_schedule_read_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "role_review_schedule",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_role_review_schedule_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_packages\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{service_packages_manage,service_packages_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_packages_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role,shift_schedules_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`anon\\` for action \\`DELETE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_anon_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`anon\\` for action \\`UPDATE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_anon_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{super_admin_can_manage_roles,system_can_insert_roles}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{super_admin_can_manage_roles,users_roles_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.afip_configurations\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage AFIP configs\",\"Supervisors can view AFIP configs\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "afip_configurations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_afip_configurations_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.assets\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Assets are manageable by supervisors\",\"Assets are viewable by authenticated users\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "assets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_assets_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.billing_cycles\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage billing cycles\",\"Users can view billing cycles\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "billing_cycles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_billing_cycles_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.business_profiles\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{business_profiles_admin_access,business_profiles_read_authenticated}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "business_profiles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_business_profiles_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.carts\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all carts\",\"Users can manage their own carts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "carts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_carts_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalog_products\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalog products\",\"Catalog products are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalog_products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalog_products_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalogs\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalogs\",\"Catalogs are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalogs",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalogs_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.customer_packages\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{customer_packages_manage_staff,customer_packages_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "customer_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_customer_packages_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.deliveries\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage deliveries\",\"Users can view deliveries\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "deliveries",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_deliveries_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_assignments\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{delivery_assignments_driver_policy,delivery_assignments_manage_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_assignments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_assignments_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access,employees_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.integrations\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Only admins can manage integrations\",\"Only admins can read integrations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "integrations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_integrations_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.maintenance_schedules\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage maintenance schedules\",\"Users can view maintenance schedules\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "maintenance_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_maintenance_schedules_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.member_benefits\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active benefits\",\"Staff can manage benefits\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "member_benefits",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_member_benefits_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_tiers\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active membership tiers\",\"Staff can manage membership tiers\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_tiers",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_tiers_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_usage\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage membership usage\",\"Users can view their membership usage\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_usage",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_usage_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.memberships\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all memberships\",\"Users can view their own membership\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "memberships",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_memberships_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{orders_admin_full_access,orders_operator_read,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role,payment_methods_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payments\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payments\",\"Users can view their payments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payments_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.pickup_time_slots\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{pickup_time_slots_manage_policy,pickup_time_slots_read_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "pickup_time_slots",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_pickup_time_slots_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.provider_availability\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{provider_availability_manage,provider_availability_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "provider_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_provider_availability_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_items\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active rental items\",\"Staff can manage rental items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_items_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_reservations\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all reservations\",\"Users can view their own reservations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_reservations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_reservations_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.role_review_schedule\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{role_review_schedule_manage_policy,role_review_schedule_read_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "role_review_schedule",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_role_review_schedule_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_packages\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{service_packages_manage,service_packages_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_packages_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role,shift_schedules_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticated\\` for action \\`DELETE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticated_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticated\\` for action \\`UPDATE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticated_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.user_roles\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Everyone can read user roles\",\"Only admins can manage user roles\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "user_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_user_roles_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{super_admin_can_manage_roles,system_can_insert_roles}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{super_admin_can_manage_roles,users_roles_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.afip_configurations\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage AFIP configs\",\"Supervisors can view AFIP configs\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "afip_configurations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_afip_configurations_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.billing_cycles\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage billing cycles\",\"Users can view billing cycles\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "billing_cycles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_billing_cycles_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.business_profiles\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{business_profiles_admin_access,business_profiles_read_authenticated}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "business_profiles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_business_profiles_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.carts\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all carts\",\"Users can manage their own carts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "carts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_carts_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalog_products\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalog products\",\"Catalog products are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalog_products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalog_products_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalogs\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalogs\",\"Catalogs are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalogs",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalogs_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.customer_packages\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{customer_packages_manage_staff,customer_packages_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "customer_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_customer_packages_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.deliveries\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage deliveries\",\"Users can view deliveries\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "deliveries",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_deliveries_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_assignments\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{delivery_assignments_driver_policy,delivery_assignments_manage_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_assignments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_assignments_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access,employees_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.integrations\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Only admins can manage integrations\",\"Only admins can read integrations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "integrations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_integrations_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.maintenance_schedules\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage maintenance schedules\",\"Users can view maintenance schedules\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "maintenance_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_maintenance_schedules_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.member_benefits\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active benefits\",\"Staff can manage benefits\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "member_benefits",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_member_benefits_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_tiers\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active membership tiers\",\"Staff can manage membership tiers\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_tiers",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_tiers_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_usage\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage membership usage\",\"Users can view their membership usage\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_usage",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_usage_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.memberships\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all memberships\",\"Users can view their own membership\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "memberships",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_memberships_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{orders_admin_full_access,orders_operator_read,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role,payment_methods_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payments\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payments\",\"Users can view their payments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payments_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.provider_availability\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{provider_availability_manage,provider_availability_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "provider_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_provider_availability_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_items\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active rental items\",\"Staff can manage rental items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_items_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_reservations\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all reservations\",\"Users can view their own reservations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_reservations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_reservations_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.role_review_schedule\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{role_review_schedule_manage_policy,role_review_schedule_read_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "role_review_schedule",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_role_review_schedule_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_packages\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{service_packages_manage,service_packages_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_packages_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role,shift_schedules_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticator\\` for action \\`DELETE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticator_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`authenticator\\` for action \\`UPDATE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_authenticator_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{super_admin_can_manage_roles,system_can_insert_roles}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{super_admin_can_manage_roles,users_roles_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.afip_configurations\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage AFIP configs\",\"Supervisors can view AFIP configs\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "afip_configurations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_afip_configurations_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.billing_cycles\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage billing cycles\",\"Users can view billing cycles\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "billing_cycles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_billing_cycles_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.business_profiles\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{business_profiles_admin_access,business_profiles_read_authenticated}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "business_profiles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_business_profiles_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.carts\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all carts\",\"Users can manage their own carts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "carts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_carts_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalog_products\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalog products\",\"Catalog products are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalog_products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalog_products_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.catalogs\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage catalogs\",\"Catalogs are publicly readable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "catalogs",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_catalogs_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.customer_packages\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{customer_packages_manage_staff,customer_packages_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "customer_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_customer_packages_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.deliveries\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage deliveries\",\"Users can view deliveries\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "deliveries",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_deliveries_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_assignments\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{delivery_assignments_driver_policy,delivery_assignments_manage_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_assignments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_assignments_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.delivery_orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{delivery_orders_admin_access,delivery_orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "delivery_orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_delivery_orders_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_availability\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{employee_availability_admin_manage,employee_availability_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_availability_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employee_skills\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{employee_skills_admin_manage,employee_skills_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employee_skills",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employee_skills_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access,employees_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.employees\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{employees_admin_full_access,employees_service_role_access}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "employees",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_employees_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.integrations\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Only admins can manage integrations\",\"Only admins can read integrations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "integrations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_integrations_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.maintenance_schedules\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Authenticated users can manage maintenance schedules\",\"Users can view maintenance schedules\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "maintenance_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_maintenance_schedules_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.member_benefits\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active benefits\",\"Staff can manage benefits\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "member_benefits",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_member_benefits_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_tiers\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active membership tiers\",\"Staff can manage membership tiers\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_tiers",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_tiers_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.membership_usage\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage membership usage\",\"Users can view their membership usage\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "membership_usage",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_membership_usage_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.memberships\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all memberships\",\"Users can view their own membership\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "memberships",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_memberships_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{orders_admin_full_access,orders_operator_read,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{orders_admin_full_access,orders_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role,payment_methods_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payment_methods\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{payment_methods_admin_access,payment_methods_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payment_methods",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payment_methods_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payments\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payments\",\"Users can view their payments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payments_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.provider_availability\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{provider_availability_manage,provider_availability_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "provider_availability",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_provider_availability_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_items\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Anyone can view active rental items\",\"Staff can manage rental items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_items_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.rental_reservations\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can manage all reservations\",\"Users can view their own reservations\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "rental_reservations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_rental_reservations_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.role_review_schedule\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{role_review_schedule_manage_policy,role_review_schedule_read_policy}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "role_review_schedule",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_role_review_schedule_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_packages\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{service_packages_manage,service_packages_select_public}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_packages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_packages_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role,shift_schedules_staff_read}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.shift_schedules\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{shift_schedules_admin_full_access,shift_schedules_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "shift_schedules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_shift_schedules_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`DELETE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_dashboard_user_DELETE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.staffing_requirements\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`UPDATE\\`. Policies include \\`{staffing_requirements_admin_manage,staffing_requirements_service_role}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "staffing_requirements",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_staffing_requirements_dashboard_user_UPDATE"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{super_admin_can_manage_roles,system_can_insert_roles}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users_roles\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{super_admin_can_manage_roles,users_roles_select_unified}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users_roles",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_roles_dashboard_user_SELECT"
  }
]