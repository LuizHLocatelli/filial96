import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FILE_SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB

interface RequestBody {
  assistantId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  // Legacy support
  base64Data?: string;
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

// Upload file to Gemini File API for large files (supports up to 2GB)
async function uploadToGeminiFileAPI(fileBytes: Uint8Array, mimeType: string, displayName: string): Promise<string> {
  // Step 1: Start resumable upload
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(fileBytes.length),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: displayName } }),
    }
  );

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Gemini File API start failed: ${err}`);
  }

  const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) throw new Error("No upload URL returned from Gemini File API");

  // Step 2: Upload the file bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(fileBytes.length),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: fileBytes,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Gemini File API upload failed: ${err}`);
  }

  const fileInfo = await uploadRes.json();
  const fileUri = fileInfo.file?.uri;
  if (!fileUri) throw new Error("No file URI returned from Gemini File API");

  console.log(`Uploaded to Gemini File API: ${fileUri}, state: ${fileInfo.file?.state}`);

  // Step 3: Wait for file to be ACTIVE (processing can take time for large files)
  const fileName = fileInfo.file?.name;
  if (fileName) {
    let attempts = 0;
    const maxAttempts = 30; // up to 5 minutes
    while (attempts < maxAttempts) {
      const statusRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`
      );
      if (statusRes.ok) {
        const status = await statusRes.json();
        if (status.state === "ACTIVE") {
          console.log("File is ACTIVE, ready for use");
          break;
        }
        console.log(`File state: ${status.state}, waiting...`);
      }
      attempts++;
      await new Promise(r => setTimeout(r, 10000)); // wait 10s
    }
    if (attempts >= maxAttempts) {
      throw new Error("Gemini File API: file processing timed out");
    }
  }

  return fileUri;
}

async function extractTextWithFileUri(fileUri: string, mimeType: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "Extract ALL text content, spoken words, transcriptions, or descriptions from this file. Return ONLY the raw text, no formatting, no explanations. If it's a PDF or image, use OCR to extract everything. If it's audio or video, transcribe the speech and describe the visual content." }] },
      contents: [{
        role: "user",
        parts: [
          { fileData: { mimeType, fileUri } },
          { text: "Extract or transcribe all information from this file." }
        ]
      }],
      generationConfig: { temperature: 0.1 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Text extraction (fileUri) failed: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function extractTextWithBase64(base64Data: string, mimeType: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    throw new Error(`Text extraction (base64) failed: ${err}`);
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
    const { assistantId, userId, fileName, fileUrl, mimeType, fileSize, base64Data } = body;

    if (!assistantId || !userId) {
      throw new Error("Missing required fields");
    }

    console.log(`Processing document: ${fileName} (${fileSize ? Math.round(fileSize / 1024) + 'KB' : 'unknown size'}) for assistant: ${assistantId}`);

    let extractedText: string;

    if (base64Data) {
      // Legacy path: base64 was sent directly (small files from old clients)
      console.log("Using legacy base64 path");
      extractedText = await extractTextWithBase64(base64Data, mimeType);
    } else if (fileUrl) {
      // New path: download from URL, then decide strategy based on size
      console.log(`Downloading file from URL: ${fileUrl}`);
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) {
        throw new Error(`Failed to download file from storage: ${fileRes.status} ${fileRes.statusText}`);
      }

      const fileBytes = new Uint8Array(await fileRes.arrayBuffer());
      const actualSize = fileBytes.length;
      console.log(`Downloaded ${actualSize} bytes`);

      if (actualSize > FILE_SIZE_THRESHOLD) {
        // Large file: use Gemini File API
        console.log("Using Gemini File API for large file");
        const fileUri = await uploadToGeminiFileAPI(fileBytes, mimeType, fileName);
        extractedText = await extractTextWithFileUri(fileUri, mimeType);
      } else {
        // Small file: convert to base64 and use inlineData
        console.log("Using inlineData for small file");
        // Convert Uint8Array to base64
        let binary = "";
        const len = fileBytes.length;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(fileBytes[i]);
        }
        const b64 = btoa(binary);
        extractedText = await extractTextWithBase64(b64, mimeType);
      }
    } else {
      throw new Error("No file data provided (fileUrl or base64Data required)");
    }

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
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
