import { supabase } from "@/integrations/supabase/client";
import { PastaComCounts, ArquivoGerencial } from "../types";

export const queryKeys = {
  pastas: {
    all: ["pastas_gerenciais"] as const,
    list: (pastaPaiId: string | null) => ["pastas_gerenciais", "list", pastaPaiId] as const,
    detail: (id: string) => ["pastas_gerenciais", "detail", id] as const,
    allFolders: ["pastas_gerenciais", "all"] as const,
  },
  arquivos: {
    all: ["arquivos_gerenciais"] as const,
    list: (pastaId: string | null) => ["arquivos_gerenciais", "list", pastaId] as const,
    detail: (id: string) => ["arquivos_gerenciais", "detail", id] as const,
  },
};

export async function fetchPastas(pastaPaiId: string | null): Promise<PastaComCounts[]> {
  let query = supabase
    // @ts-expect-error - View not in generated types
    .from("gerencial_pastas_com_counts")
    .select("*")
    .order("nome");

  if (pastaPaiId === null) {
    query = query.is("pasta_pai_id", null);
  } else if (pastaPaiId) {
    query = query.eq("pasta_pai_id", pastaPaiId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as unknown) as PastaComCounts[];
}

export async function fetchPastaById(id: string): Promise<PastaComCounts | null> {
  if (!id) return null;

  const { data, error } = await supabase
    // @ts-expect-error - View not in generated types
    .from("gerencial_pastas_com_counts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as PastaComCounts;
}

export async function fetchAllPastas(): Promise<PastaComCounts[]> {
  const { data, error } = await supabase
    // @ts-expect-error - View not in generated types
    .from("gerencial_pastas_com_counts")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data as unknown) as PastaComCounts[];
}

export async function fetchArquivos(pastaId: string | null): Promise<ArquivoGerencial[]> {
  let query = supabase
    .from("gerencial_arquivos")
    .select("*")
    .order("created_at", { ascending: false });

  if (pastaId === null) {
    query = query.is("pasta_id", null);
  } else if (pastaId) {
    query = query.eq("pasta_id", pastaId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ArquivoGerencial[];
}

export async function createPasta(
  nome: string,
  createdBy: string,
  pastaPaiId: string | null = null
): Promise<PastaComCounts> {
  const { data, error } = await supabase
    .from("gerencial_pastas")
    .insert({
      nome: nome.trim(),
      pasta_pai_id: pastaPaiId,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PastaComCounts;
}

export async function updatePasta(
  id: string,
  updates: { nome?: string; cor?: string; icone?: string; pasta_pai_id?: string | null }
): Promise<PastaComCounts> {
  const { data, error } = await supabase
    .from("gerencial_pastas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PastaComCounts;
}

export async function deletePasta(id: string): Promise<void> {
  const { error } = await supabase
    .from("gerencial_pastas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function deleteArquivo(arquivo: ArquivoGerencial): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from("diretorio_gerencial")
    .remove([arquivo.caminho_storage]);

  if (storageError) throw storageError;

  const { error: dbError } = await supabase
    .from("gerencial_arquivos")
    .delete()
    .eq("id", arquivo.id);

  if (dbError) throw dbError;
}

export async function moveArquivo(
  arquivoId: string,
  pastaId: string | null
): Promise<ArquivoGerencial> {
  const { data, error } = await supabase
    .from("gerencial_arquivos")
    .update({ pasta_id: pastaId })
    .eq("id", arquivoId)
    .select()
    .single();

  if (error) throw error;
  return data as ArquivoGerencial;
}

export async function movePasta(
  pastaId: string,
  pastaPaiId: string | null
): Promise<PastaComCounts> {
  const { data, error } = await supabase
    .from("gerencial_pastas")
    .update({ pasta_pai_id: pastaPaiId })
    .eq("id", pastaId)
    .select()
    .single();

  if (error) throw error;
  return data as PastaComCounts;
}

export async function uploadArquivo(
  file: File,
  userId: string,
  pastaId: string | null,
  customFileName?: string
): Promise<ArquivoGerencial> {
  const fileExt = file.name.split(".").pop();
  const storageFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${storageFileName}`;

  const displayName = customFileName
    ? `${customFileName}.${fileExt}`
    : file.name;

  const { error: uploadError } = await supabase.storage
    .from("diretorio_gerencial")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: dbData, error: dbError } = await supabase
    .from("gerencial_arquivos")
    .insert({
      nome_arquivo: displayName,
      caminho_storage: filePath,
      tipo_arquivo: file.type,
      tamanho_bytes: file.size,
      criado_por: userId,
      pasta_id: pastaId,
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return dbData as ArquivoGerencial;
}

export function getPublicUrl(caminhoStorage: string): string {
  const { data } = supabase.storage
    .from("diretorio_gerencial")
    .getPublicUrl(caminhoStorage);
  return data.publicUrl;
}
