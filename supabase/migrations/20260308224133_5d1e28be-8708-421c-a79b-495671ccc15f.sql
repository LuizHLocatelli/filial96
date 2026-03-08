
-- Fix: column was already altered to 3072 by partial migration, drop and recreate with 1024
ALTER TABLE public.ai_assistant_documents DROP COLUMN IF EXISTS embedding;
ALTER TABLE public.ai_assistant_documents ADD COLUMN embedding vector(1024);

-- Recreate HNSW index (1024 is within 2000 limit)
DROP INDEX IF EXISTS idx_ai_assistant_documents_embedding;
CREATE INDEX idx_ai_assistant_documents_embedding
  ON public.ai_assistant_documents
  USING hnsw (embedding vector_cosine_ops);

-- Update match function for 1024 dimensions
CREATE OR REPLACE FUNCTION public.match_assistant_documents(
  query_embedding vector(1024),
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
