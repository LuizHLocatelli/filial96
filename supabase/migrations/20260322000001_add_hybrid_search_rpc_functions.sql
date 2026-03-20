-- Create hybrid search function combining vector similarity + BM25 full-text search
CREATE OR REPLACE FUNCTION public.match_assistant_documents_hybrid(
  p_query_embedding vector(3072),
  p_query_text text,
  p_assistant_id uuid,
  p_match_threshold double precision DEFAULT 0.45,
  p_match_count integer DEFAULT 10,
  p_vector_weight double precision DEFAULT 0.6,
  p_fts_weight double precision DEFAULT 0.4
)
RETURNS TABLE (
  id uuid,
  file_name text,
  content_text text,
  similarity double precision,
  rank double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH 
    max_fts AS (
      SELECT COALESCE(MAX(ts_rank_cd(ad.content_tsvector, plainto_tsquery('portuguese', p_query_text))), 1) as max_rank
      FROM public.ai_assistant_documents ad
      WHERE ad.assistant_id = p_assistant_id
        AND ad.content_tsvector IS NOT NULL
        AND plainto_tsquery('portuguese', p_query_text) @@ ad.content_tsvector
    ),
    combined_scores AS (
      SELECT
        ad.id,
        ad.file_name,
        ad.content_text,
        1 - (ad.embedding <=> p_query_embedding) AS vector_sim,
        CASE 
          WHEN ad.content_tsvector IS NOT NULL AND plainto_tsquery('portuguese', p_query_text) @@ ad.content_tsvector 
          THEN ts_rank_cd(ad.content_tsvector, plainto_tsquery('portuguese', p_query_text))
          ELSE 0 
        END AS fts_rank,
        (p_vector_weight * (1 - (ad.embedding <=> p_query_embedding)) + 
         p_fts_weight * COALESCE(ts_rank_cd(ad.content_tsvector, plainto_tsquery('portuguese', p_query_text)) / NULLIF((SELECT max_rank FROM max_fts), 0), 0)) AS combined_score
      FROM public.ai_assistant_documents ad
      WHERE ad.assistant_id = p_assistant_id
        AND ad.embedding IS NOT NULL
    )
  SELECT
    c.id,
    c.file_name,
    c.content_text,
    c.combined_score AS similarity,
    ROW_NUMBER() OVER (ORDER BY c.combined_score DESC) AS rank
  FROM combined_scores c
  WHERE c.combined_score > p_match_threshold
  ORDER BY c.combined_score DESC
  LIMIT p_match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.reindex_documents_tsvector()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_assistant_documents 
  SET content_text = content_text 
  WHERE content_tsvector IS NULL;
  RAISE NOTICE 'TSvector reindex completed';
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_assistant_documents_hybrid TO anon;
GRANT EXECUTE ON FUNCTION public.reindex_documents_tsvector TO anon;
GRANT EXECUTE ON FUNCTION public.reindex_documents_tsvector TO authenticated;
GRANT EXECUTE ON FUNCTION public.reindex_documents_tsvector TO service_role;
