-- Create hybrid search function combining vector similarity + BM25 full-text search
-- Uses OR combination for broad recall, then ranks by term frequency
CREATE OR REPLACE FUNCTION public.match_assistant_documents_hybrid(
  p_query_embedding vector(3072),
  p_query_text text,
  p_assistant_id uuid,
  p_match_threshold double precision DEFAULT 0.35,
  p_match_count integer DEFAULT 15,
  p_vector_weight double precision DEFAULT 0.85,
  p_fts_weight double precision DEFAULT 0.15
)
RETURNS TABLE (
  id uuid,
  file_name text,
  content_text text,
  similarity double precision,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terms text[];
  v_filtered_terms text[];
  v_prefixes text[];
  v_tsquery tsquery;
  v_stop_words text[] := ARRAY['que', 'qual', 'para', 'com', 'uma', 'umas', 'uns', 'umas', 'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'da', 'de', 'do', 'em', 'no', 'na', 'mais', 'perto'];
BEGIN
  -- Extract terms and filter out stop words and short words
  SELECT ARRAY_AGG(LOWER(TRIM(regexp_replace(term, '["''.,;:!?()]', '', 'g'))))
  INTO v_terms
  FROM regexp_split_to_table(p_query_text, E'\\s+') AS term
  WHERE LENGTH(TRIM(regexp_replace(term, '["''.,;:!?()]', '', 'g'))) > 2;
  
  -- Filter out stop words
  SELECT ARRAY_AGG(term) INTO v_filtered_terms
  FROM unnest(v_terms) AS term
  WHERE term NOT ILIKE ANY(v_stop_words);
  
  -- Build OR-based prefix query for broad recall (any term matches)
  IF array_length(v_filtered_terms, 1) > 0 THEN
    SELECT ARRAY_AGG(term || ':*') INTO v_prefixes FROM unnest(v_filtered_terms) AS term;
    v_tsquery := to_tsquery('portuguese', array_to_string(v_prefixes, ' | '));
  ELSE
    v_tsquery := plainto_tsquery('portuguese', p_query_text);
  END IF;

  RETURN QUERY
  WITH
    max_fts AS (-- Get max FTS rank for normalization
      SELECT CASE WHEN MAX(ts_rank_cd(ad.content_tsvector, v_tsquery)) > 0
                 THEN MAX(ts_rank_cd(ad.content_tsvector, v_tsquery))
                 ELSE 0.001 END as max_rank
      FROM public.ai_assistant_documents ad
      WHERE ad.assistant_id = p_assistant_id
        AND ad.content_tsvector IS NOT NULL
    ),
    combined_scores AS (
      SELECT
        ad.id,
        ad.file_name,
        ad.content_text,
        1 - (ad.embedding <=> p_query_embedding) AS vector_sim,
        ts_rank_cd(ad.content_tsvector, v_tsquery) AS fts_rank,
        CASE
          WHEN ts_rank_cd(ad.content_tsvector, v_tsquery) > 0 THEN
            (p_vector_weight * (1 - (ad.embedding <=> p_query_embedding)) +
             p_fts_weight * ts_rank_cd(ad.content_tsvector, v_tsquery) / NULLIF((SELECT max_rank FROM max_fts), 0))
          ELSE
            (1 - (ad.embedding <=> p_query_embedding))
        END AS combined_score
      FROM public.ai_assistant_documents ad
      WHERE ad.assistant_id = p_assistant_id
        AND ad.embedding IS NOT NULL
    )
  SELECT
    c.id,
    c.file_name,
    c.content_text,
    c.combined_score AS similarity,
    ROW_NUMBER() OVER (ORDER BY c.combined_score DESC)::bigint AS rank
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