import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
      },
    });
  }

  const { userId } = await req.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Create admin client using service_role from environment
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://abpsafkioslfjqtgtvbi.supabase.co";
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Service role key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Delete profile first
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile delete error:", profileError);
    }

    // Delete from auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError && authError.status !== 404) {
      console.error("Auth delete error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
