import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  assistantId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  base64Data: string;
  mimeType: string;
}

// Split text into chunks of ~1000 chars with overlap
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

async function extractTextFromFile(base64Data: string, mimeType: string): Promise<string> {
  // Use Gemini to extract text from the document (multimodal)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "Extract ALL text content, spoken words, transcriptions, or descriptions from this file. Return ONLY the raw text, no formatting, no explanations. If it's a PDF or image, use OCR to extract everything. If it's audio or video, transcribe the speech and describe the visual content." }] },
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Extract or transcribe all information from this file." }
        ]
      }],
      generationConfig: { temperature: 0.1 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Text extraction failed: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateEmbedding(text: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-2-preview",
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 3072,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding generation failed: ${err}`);
  }

  const data = await res.json();
  return data.embedding?.values || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { assistantId, userId, fileName, fileUrl, base64Data, mimeType } = body;

    if (!assistantId || !userId || !base64Data) {
      throw new Error("Missing required fields");
    }

    console.log(`Processing document: ${fileName} for assistant: ${assistantId}`);

    // 1. Extract text from document
    const extractedText = await extractTextFromFile(base64Data, mimeType);
    if (!extractedText.trim()) {
      throw new Error("Could not extract text from document");
    }
    console.log(`Extracted ${extractedText.length} chars from document`);

    // 2. Chunk the text
    const chunks = chunkText(extractedText);
    console.log(`Split into ${chunks.length} chunks`);

    // 3. Generate embeddings and insert each chunk
    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);

      if (embedding.length === 0) {
        console.warn(`Empty embedding for chunk ${i}, skipping`);
        continue;
      }

      // Format embedding as pgvector string
      const embeddingStr = `[${embedding.join(",")}]`;

      const { error } = await supabase
        .from("ai_assistant_documents")
        .insert({
          assistant_id: assistantId,
          user_id: userId,
          file_name: fileName,
          file_url: fileUrl,
          content_text: chunk,
          embedding: embeddingStr,
          chunk_index: i,
        });

      if (error) {
        console.error(`Error inserting chunk ${i}:`, error);
        throw error;
      }

      results.push({ chunk_index: i, chars: chunk.length });
    }

    return new Response(
      JSON.stringify({ success: true, chunks: results.length, totalChars: extractedText.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
