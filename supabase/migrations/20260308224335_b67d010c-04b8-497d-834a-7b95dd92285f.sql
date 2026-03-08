
-- Update embedding column to 3072 dimensions for gemini-embedding-001
-- pgvector HNSW/IVFFlat have 2000 dim limit, so we use no vector index
-- Filtering by assistant_id + sequential scan on embeddings is fine for RAG use case
ALTER TABLE public.ai_assistant_documents DROP COLUMN IF EXISTS embedding;
ALTER TABLE public.ai_assistant_documents ADD COLUMN embedding vector(3072);

-- Drop old vector index if exists
DROP INDEX IF EXISTS idx_ai_assistant_documents_embedding;

-- Create a regular index on assistant_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_ai_assistant_documents_assistant_id
  ON public.ai_assistant_documents (assistant_id);

-- Update match function for 3072 dimensions
CREATE OR REPLACE FUNCTION public.match_assistant_documents(
  query_embedding vector(3072),
  p_assistant_id uuid,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  file_name text,
  content_text text,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ad.id,
    ad.file_name,
    ad.content_text,
    1 - (ad.embedding <=> query_embedding) AS similarity
  FROM public.ai_assistant_documents ad
  WHERE ad.assistant_id = p_assistant_id
    AND ad.embedding IS NOT NULL
    AND 1 - (ad.embedding <=> query_embedding) > match_threshold
  ORDER BY ad.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
