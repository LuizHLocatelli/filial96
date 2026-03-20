import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import pdf from "npm:pdf-parse@1.1.1";
import { Buffer } from "node:buffer";

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

function chunkText(text: string, chunkSize = 1800, overlap = 400): string[] {
  // Split by double newlines (paragraphs) to preserve semantic structure
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    const paragraphLength = trimmedParagraph.length;
    
    // If single paragraph exceeds chunk size, split by sentences
    if (paragraphLength > chunkSize) {
      // First, save current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n\n"));
        // Keep overlap from previous chunks
        const overlapParagraphs: string[] = [];
        let overlapLength = 0;
        for (let i = currentChunk.length - 1; i >= 0; i--) {
          const p = currentChunk[i];
          if (overlapLength + p.length > overlap) break;
          overlapParagraphs.unshift(p);
          overlapLength += p.length + 2;
        }
        currentChunk = overlapParagraphs;
        currentLength = currentChunk.join("\n\n").length;
      }
      
      // Split long paragraph by sentences while respecting markdown structure
      const sentences = trimmedParagraph.match(/[^.!?]+[.!?]+/g) || [trimmedParagraph];
      let sentenceChunk: string[] = [];
      let sentenceLength = 0;
      
      for (const sentence of sentences) {
        sentenceChunk.push(sentence);
        sentenceLength += sentence.length;
        
        if (sentenceLength >= chunkSize * 0.8) {
          const chunkText = sentenceChunk.join(" ");
          if (chunkText.length > 200) {
            chunks.push(chunkText);
          }
          // Keep last sentences as overlap
          const overlapSentences = sentenceChunk.slice(-2);
          sentenceChunk = overlapSentences;
          sentenceLength = overlapSentences.join(" ").length;
        }
      }
      
      if (sentenceChunk.length > 0) {
        const remainingText = sentenceChunk.join(" ");
        if (remainingText.length > 200) {
          currentChunk.push(remainingText);
          currentLength += remainingText.length;
        }
      }
    } else {
      // Normal paragraph, add to current chunk
      currentChunk.push(trimmedParagraph);
      currentLength += paragraphLength + 2;
      
      // If chunk is big enough, save it
      if (currentLength >= chunkSize) {
        chunks.push(currentChunk.join("\n\n"));
        
        // Keep overlap paragraphs for context continuity
        const overlapParagraphs: string[] = [];
        let overlapLength = 0;
        for (let i = currentChunk.length - 1; i >= 0; i--) {
          const p = currentChunk[i];
          if (overlapLength + p.length > overlap) break;
          overlapParagraphs.unshift(p);
          overlapLength += p.length + 2;
        }
        currentChunk = overlapParagraphs;
        currentLength = currentChunk.join("\n\n").length;
      }
    }
  }
  
  // Add remaining content
  if (currentChunk.length > 0 && currentLength > 100) {
    chunks.push(currentChunk.join("\n\n"));
  }
  
  // Clean up chunks - remove very short ones and merge if needed
  const cleanedChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length < 300 && cleanedChunks.length > 0) {
      // Merge short chunk with previous
      cleanedChunks[cleanedChunks.length - 1] += "\n\n" + chunk;
    } else {
      cleanedChunks.push(chunk);
    }
  }
  
  return cleanedChunks;
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

  // Wait for ACTIVE state (Limit to 15 tries to prevent Edge Function timeout)
  const fileName = fileInfo.file?.name;
  if (fileName) {
    for (let i = 0; i < 15; i++) {
      const statusRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`
      );
      if (statusRes.ok) {
        const s = await statusRes.json();
        if (s.state === "ACTIVE") { console.log("File ACTIVE"); break; }
        if (s.state === "FAILED") { throw new Error("Gemini File API processing FAILED"); }
        console.log(`State: ${s.state}, waiting...`);
      }
      if (i === 14) { throw new Error("File processing timeout on Gemini API"); }
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

    // Create status record
    await supabase.from("ai_assistant_document_status").insert({
      assistant_id: assistantId,
      file_name: fileName,
      file_url: fileUrl,
      status: "processing"
    });

    let extractedText = "";

    // Parse PDF natively avoiding Gemini API token limits
    if (mimeType === "application/pdf") {
      console.log(`[BG] Native PDF parse: ${fileName}`);
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error(`Failed to download PDF: ${fileRes.status}`);
      const fileBuf = await fileRes.arrayBuffer();
      const pdfData = await pdf(Buffer.from(fileBuf));
      extractedText = pdfData.text;
    } else {
      console.log(`[BG] Gemini File API (Vision): ${fileName}`);
      const fileUri = await uploadToGeminiFileAPI(fileUrl, mimeType, fileName);
      extractedText = await extractTextWithFileUri(fileUri, mimeType);
    }

    if (!extractedText || !extractedText.trim()) {
      throw new Error("Não foi possível extrair nenhum texto legível do arquivo.");
    }
    
    console.log(`[BG] Extracted ${extractedText.length} chars`);

    const chunks = chunkText(extractedText);
    console.log(`[BG] ${chunks.length} chunks`);

    // Process embeddings in batches to avoid API limits and speed up
    const embeddings: number[][] = [];
    const batchSize = 10;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchPromises = batchChunks.map(chunk => 
        generateEmbedding(chunk).catch(err => {
          console.error(`[BG] Embedding failed for a chunk:`, err);
          return [];
        })
      );
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
    }

    // Prepare DB rows
    const rowsToInsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = embeddings[i];
      if (!embedding || embedding.length === 0) { 
        console.warn(`[BG] Empty embedding chunk ${i}`); 
        continue; 
      }

      rowsToInsert.push({
        assistant_id: assistantId,
        user_id: userId,
        file_name: fileName,
        file_url: fileUrl,
        content_text: chunks[i],
        embedding: `[${embedding.join(",")}]`,
        chunk_index: i,
      });
    }

    // Insert to DB in batches
    let insertedCount = 0;
    const dbBatchSize = 50;
    for (let i = 0; i < rowsToInsert.length; i += dbBatchSize) {
      const batch = rowsToInsert.slice(i, i + dbBatchSize);
      const { error } = await supabase
        .from("ai_assistant_documents")
        .insert(batch);
      
      if (error) { 
        console.error(`[BG] Insert error db batch ${i}:`, error); 
      } else {
        insertedCount += batch.length;
      }
    }

    // Success -> Update status
    await supabase.from("ai_assistant_document_status")
      .update({ status: "completed" })
      .match({ assistant_id: assistantId, file_url: fileUrl });

    console.log(`[BG] Done: ${fileName} — ${insertedCount}/${chunks.length} chunks inserted`);
  } catch (err) {
    console.error(`[BG] Failed: ${fileName}`, err);
    
    // Error -> Update status
    await supabase.from("ai_assistant_document_status")
      .update({ 
        status: "error", 
        error_message: err instanceof Error ? err.message : String(err) 
      })
      .match({ assistant_id: assistantId, file_url: fileUrl });
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
