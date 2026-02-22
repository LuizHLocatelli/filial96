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
    // Helper function to safely delete from a table (ignores errors if table doesn't exist)
    const safeDelete = async (table: string, column: string, value: string) => {
      try {
        await adminClient.from(table).delete().eq(column, value);
      } catch (e) {
        // Ignore errors (table might not exist)
      }
    };

    // Helper function to safely update a table
    const safeUpdate = async (table: string, data: Record<string, string | null>, column: string, value: string) => {
      try {
        await adminClient.from(table).update(data).eq(column, value);
      } catch (e) {
        // Ignore errors (table might not exist)
      }
    };

    // Delete all user-related data from various tables
    // Tables with user_id column
    await safeDelete("ocr_logs", "user_id", userId);
    await safeDelete("crediario_depositos_statistics", "user_id", userId);

    // Tables with created_by column
    await safeDelete("moveis_rotinas_conclusoes", "created_by", userId);
    await safeDelete("moveis_rotinas", "created_by", userId);
    await safeDelete("moveis_arquivos", "created_by", userId);
    await safeDelete("moveis_categorias", "created_by", userId);
    await safeDelete("moveis_orientacoes", "criado_por", userId);
    await safeDelete("moveis_produto_foco", "created_by", userId);
    await safeDelete("moveis_produto_foco_imagens", "created_by", userId);
    await safeDelete("moveis_produto_foco_vendas", "created_by", userId);
    await safeDelete("moveis_tarefas", "criado_por", userId);
    await safeDelete("moveis_descontinuados", "created_by", userId);
    await safeDelete("crediario_sticky_notes", "created_by", userId);
    await safeDelete("crediario_folgas", "created_by", userId);
    await safeDelete("crediario_folgas", "crediarista_id", userId);
    await safeDelete("crediario_depositos", "created_by", userId);
    await safeDelete("crediario_directory_categories", "created_by", userId);
    await safeDelete("crediario_directory_files", "created_by", userId);
    await safeDelete("moda_arquivos", "created_by", userId);
    await safeDelete("moda_categorias", "created_by", userId);
    await safeDelete("moda_folgas", "created_by", userId);
    await safeDelete("moda_produto_foco", "created_by", userId);
    await safeDelete("moda_produto_foco_imagens", "created_by", userId);
    await safeDelete("moda_produto_foco_vendas", "created_by", userId);
    await safeDelete("moda_estoque_contagens", "created_by", userId);
    await safeDelete("moda_estoque_produtos", "created_by", userId);
    await safeDelete("moda_reservas", "created_by", userId);
    await safeDelete("cartaz_folders", "created_by", userId);
    await safeDelete("cartazes", "created_by", userId);
    await safeDelete("fretes", "created_by", userId);
    await safeDelete("attachments", "created_by", userId);
    await safeDelete("card_folders", "created_by", userId);
    await safeDelete("note_folders", "created_by", userId);
    await safeDelete("n8n_vector_store", "created_by", userId);
    await safeDelete("promotional_cards", "created_by", userId);
    await safeDelete("tasks", "created_by", userId);

    // Tables with consultora_id
    await safeDelete("moda_reservas", "consultora_id", userId);

    // Handle moveis_orientacoes_visualizacoes
    await safeDelete("moveis_orientacoes_visualizacoes", "user_id", userId);

    // Update tasks where user is assigned (set NULL instead of delete)
    await safeUpdate("tasks", { assigned_to: null }, "assigned_to", userId);

    // Delete profile first (this will cascade to tables with FK to profiles)
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
  } catch (error) {
    console.error("Delete error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
