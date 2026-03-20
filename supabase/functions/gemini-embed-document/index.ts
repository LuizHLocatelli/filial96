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
  mimeType: string;
  fileSize: number;
}

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

// Upload file to Gemini File API using the file URL directly (no memory buffering)
async function uploadToGeminiFileAPI(fileUrl: string, mimeType: string, displayName: string): Promise<string> {
  // Download file as stream and get total size
  const downloadRes = await fetch(fileUrl);
  if (!downloadRes.ok) throw new Error(`Failed to download file: ${downloadRes.status}`);

  const fileBytes = await downloadRes.arrayBuffer();
  const size = fileBytes.byteLength;
  console.log(`[Gemini File API] Uploading ${size} bytes`);

  // Start resumable upload
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(size),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: displayName } }),
    }
  );

  if (!startRes.ok) throw new Error(`File API start failed: ${await startRes.text()}`);

  const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) throw new Error("No upload URL from File API");

  // Upload the bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: fileBytes,
  });

  if (!uploadRes.ok) throw new Error(`File API upload failed: ${await uploadRes.text()}`);

  const fileInfo = await uploadRes.json();
  const fileUri = fileInfo.file?.uri;
  if (!fileUri) throw new Error("No file URI from File API");

  console.log(`Uploaded: ${fileUri}, state: ${fileInfo.file?.state}`);

  // Wait for ACTIVE state
  const fileName = fileInfo.file?.name;
  if (fileName) {
    for (let i = 0; i < 60; i++) {
      const statusRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`
      );
      if (statusRes.ok) {
        const s = await statusRes.json();
        if (s.state === "ACTIVE") { console.log("File ACTIVE"); break; }
        console.log(`State: ${s.state}, waiting...`);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  return fileUri;
}

async function extractTextWithFileUri(fileUri: string, mimeType: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "Extract ALL text content from this file. Return ONLY the raw text, no formatting, no explanations. Use OCR if needed." }] },
      contents: [{ role: "user", parts: [
        { fileData: { mimeType, fileUri } },
        { text: "Extract all text from this file." }
      ] }],
      generationConfig: { temperature: 0.1 }
    })
  });
  if (!res.ok) throw new Error(`Text extraction failed: ${await res.text()}`);
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
  if (!res.ok) throw new Error(`Embedding failed: ${await res.text()}`);
  const data = await res.json();
  return data.embedding?.values || [];
}

// Background processing — all heavy work happens here
async function processDocument(body: RequestBody) {
  const { assistantId, userId, fileName, fileUrl, mimeType } = body;

  try {
    console.log(`[BG] Processing: ${fileName}`);

    // Always use Gemini File API — avoids loading file into edge function memory as base64
    const fileUri = await uploadToGeminiFileAPI(fileUrl, mimeType, fileName);
    const extractedText = await extractTextWithFileUri(fileUri, mimeType);

    if (!extractedText.trim()) {
      console.error("[BG] No text extracted");
      return;
    }
    console.log(`[BG] Extracted ${extractedText.length} chars`);

    const chunks = chunkText(extractedText);
    console.log(`[BG] ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      if (embedding.length === 0) { console.warn(`[BG] Empty embedding chunk ${i}`); continue; }

      const { error } = await supabase
        .from("ai_assistant_documents")
        .insert({
          assistant_id: assistantId,
          user_id: userId,
          file_name: fileName,
          file_url: fileUrl,
          content_text: chunks[i],
          embedding: `[${embedding.join(",")}]`,
          chunk_index: i,
        });

      if (error) { console.error(`[BG] Insert error chunk ${i}:`, error); throw error; }
    }

    console.log(`[BG] Done: ${fileName} — ${chunks.length} chunks inserted`);
  } catch (err) {
    console.error(`[BG] Failed: ${fileName}`, err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    if (!body.assistantId || !body.userId || !body.fileUrl) {
      throw new Error("Missing required fields");
    }

    console.log(`Received: ${body.fileName}, dispatching background processing...`);

    // @ts-expect-error — EdgeRuntime available in Supabase Edge Functions
    EdgeRuntime.waitUntil(processDocument(body));

    return new Response(
      JSON.stringify({ success: true, status: "processing", fileUrl: body.fileUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
