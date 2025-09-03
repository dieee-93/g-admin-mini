// Supabase Edge Function: create-admin-user
// Crea un usuario y asigna el rol SUPER_ADMIN de forma atómica
// Docs: https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email, password, fullName } = await req.json();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Crear usuario en Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { fullName }
  });
  if (signUpError || !signUpData?.user?.id) {
    return new Response(JSON.stringify({ error: "Error creando usuario", details: signUpError?.message }), { status: 400 });
  }
  const userId = signUpData.user.id;

  // 2. Asignar rol SUPER_ADMIN en users_roles
  const { error: roleError } = await supabase.from("users_roles").insert({
    user_id: userId,
    role: "SUPER_ADMIN",
    is_active: true,
    assigned_by: null
  });
  if (roleError) {
    // Opcional: Eliminar usuario si falla la asignación de rol
    await supabase.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({ error: "Error asignando rol", details: roleError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, userId }), { status: 200 });
});
