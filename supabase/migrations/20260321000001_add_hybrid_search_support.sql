-- Add tsvector column for full-text search
ALTER TABLE public.ai_assistant_documents 
ADD COLUMN IF NOT EXISTS content_tsvector tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_ai_assistant_documents_tsvector 
ON public.ai_assistant_documents USING gin(content_tsvector);

-- Create function to update tsvector
CREATE OR REPLACE FUNCTION update_content_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_tsvector := to_tsvector('portuguese', COALESCE(NEW.content_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-update tsvector
DROP TRIGGER IF EXISTS ai_assistant_documents_tsvector_trigger ON public.ai_assistant_documents;
CREATE TRIGGER ai_assistant_documents_tsvector_trigger
  BEFORE INSERT OR UPDATE OF content_text
  ON public.ai_assistant_documents
  FOR EACH ROW EXECUTE FUNCTION update_content_tsvector();

-- Update existing records to populate tsvector
UPDATE public.ai_assistant_documents 
SET content_text = content_text 
WHERE content_tsvector IS NULL;
