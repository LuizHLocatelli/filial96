
-- Add web_search_enabled to ai_assistants
ALTER TABLE public.ai_assistants ADD COLUMN IF NOT EXISTS web_search_enabled boolean NOT NULL DEFAULT false;

-- Add document_urls to ai_chat_messages
ALTER TABLE public.ai_chat_messages ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';

-- Create ai_assistant_documents table for RAG
CREATE TABLE IF NOT EXISTS public.ai_assistant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  content_text text NOT NULL DEFAULT '',
  embedding vector(768),
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for ai_assistant_documents
ALTER TABLE public.ai_assistant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assistant documents"
  ON public.ai_assistant_documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to match assistant documents by embedding similarity
CREATE OR REPLACE FUNCTION public.match_assistant_documents(
  query_embedding vector(768),
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

-- Create index for faster vector search
CREATE INDEX IF NOT EXISTS idx_ai_assistant_documents_embedding
  ON public.ai_assistant_documents
  USING hnsw (embedding vector_cosine_ops);
