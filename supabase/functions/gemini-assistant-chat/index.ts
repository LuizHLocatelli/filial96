import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface ChatMessage {
  role: "user" | "model";
  parts: MessagePart[];
}

interface RequestBody {
  message: string;
  systemMessage: string;
  images?: string[];
  history?: ChatMessage[];
  stream?: boolean;
  generateTitle?: boolean;
}

async function handleImageGeneration(prompt: string): Promise<{ text: string; images: string[] }> {
  const imageModelName = "gemini-3.1-flash-image-preview";
  const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModelName}:generateContent?key=${GEMINI_API_KEY}`;

  const imgRes = await fetch(imageUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  if (!imgRes.ok) {
    const err = await imgRes.text();
    console.error("Image generation failed:", err);
    return { text: "Desculpe, ocorreu um erro ao tentar gerar a imagem.", images: [] };
  }

  const imgData = await imgRes.json();
  const candidates = imgData.candidates || [];
  let base64Image = null;
  let mimeType = "image/png";

  for (const cand of candidates) {
    if (cand.content?.parts) {
      for (const part of cand.content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
          break;
        }
      }
    }
    if (base64Image) break;
  }

  if (!base64Image) {
    return { text: "O modelo processou seu pedido, mas não retornou nenhuma imagem válida.", images: [] };
  }

  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `generated-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  const binaryString = atob(base64Image);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from("ai-chat-attachments")
    .upload(fileName, bytes.buffer, { contentType: mimeType, cacheControl: '3600', upsert: false });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { text: "A imagem foi gerada, mas houve um erro ao salvá-la.", images: [] };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("ai-chat-attachments")
    .getPublicUrl(fileName);

  return { text: "Aqui está a imagem que você solicitou.", images: [publicUrl] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { message, systemMessage, images = [], history = [], stream = false, generateTitle = false } = body;

    if (!message) {
      throw new Error("Message is required");
    }

    // Title generation mode - quick non-streaming call
    if (generateTitle) {
      const titleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
      const titleRes = await fetch(titleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Gere um título curto (máximo 40 caracteres) para uma conversa de chat baseado na primeira mensagem do usuário. Retorne APENAS o título, sem aspas, sem explicação." }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 30 }
        })
      });
      if (titleRes.ok) {
        const titleData = await titleRes.json();
        const title = titleData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Nova Conversa";
        return new Response(JSON.stringify({ title }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ title: "Nova Conversa" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const imageInstruction = `
[IMPORTANT INSTRUCTION FOR IMAGE GENERATION]
You have the ability to generate images using a specialized secondary model.
If the user explicitly asks you to create, generate, draw, or make an image or picture, you MUST respond with a JSON block in exactly this format and nothing else:
\`\`\`json
{
  "action": "generate_image",
  "prompt": "<detailed prompt describing the image in english>"
}
\`\`\`
Do not include any conversational text outside the JSON block if you are generating an image. If the user is NOT asking for an image, respond normally.
`;
    const finalSystemMessage = systemMessage + "\n\n" + imageInstruction;
    const chatModelName = "gemini-3-flash-preview";

    const currentMessageParts: MessagePart[] = [{ text: message }];
    for (const img of images) {
      let mimeType = "image/jpeg";
      let base64Data = img;
      if (img.startsWith("data:")) {
        const parts = img.split(";base64,");
        if (parts.length === 2) {
          mimeType = parts[0].replace("data:", "");
          base64Data = parts[1];
        }
      }
      if (base64Data) {
        currentMessageParts.push({ inlineData: { mimeType, data: base64Data } });
      }
    }

    const currentTurn: ChatMessage = { role: "user", parts: currentMessageParts };
    const contents = [...history, currentTurn];

    // Non-streaming mode (for backward compatibility / system message generation)
    if (!stream) {
      const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chatModelName}:generateContent?key=${GEMINI_API_KEY}`;
      const chatRes = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: finalSystemMessage }] },
          contents,
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!chatRes.ok) {
        const err = await chatRes.text();
        throw new Error(`Chat API error: ${err}`);
      }

      const chatData = await chatRes.json();
      let generatedText = chatData.candidates?.[0]?.content?.parts?.[0]?.text;
      let generatedImages: string[] = [];

      if (!generatedText) throw new Error("No text generated by Gemini API");

      // Check for image generation request
      let jsonStr = generatedText.trim();
      const jsonMatch = generatedText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      if (jsonStr.startsWith('{') && jsonStr.includes('"generate_image"')) {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.action === "generate_image" && parsed.prompt) {
            const result = await handleImageGeneration(parsed.prompt);
            generatedText = result.text;
            generatedImages = result.images;
          }
        } catch (e) {
          console.error("Failed to parse JSON for image generation:", e);
        }
      }

      return new Response(
        JSON.stringify({ text: generatedText, images: generatedImages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Streaming mode
    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chatModelName}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
    const streamRes = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: finalSystemMessage }] },
        contents,
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!streamRes.ok) {
      const err = await streamRes.text();
      throw new Error(`Stream API error: ${err}`);
    }

    // We need to collect all text to check for image generation at the end
    let fullText = "";
    const reader = streamRes.body!.getReader();
    const decoder = new TextDecoder();

    const outputStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let newlineIdx: number;
            while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIdx);
              buffer = buffer.slice(newlineIdx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  fullText += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // Partial JSON, skip
              }
            }
          }

          // Check if the full text was an image generation request
          const trimmed = fullText.trim();
          const jsonMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/);
          const possibleJson = jsonMatch ? jsonMatch[1].trim() : trimmed;

          if (possibleJson.startsWith('{') && possibleJson.includes('"generate_image"')) {
            try {
              const parsed = JSON.parse(possibleJson);
              if (parsed.action === "generate_image" && parsed.prompt) {
                const result = await handleImageGeneration(parsed.prompt);
                // Send image event - replace previous text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ replace: true, text: result.text, images: result.images })}\n\n`));
              }
            } catch {
              // Not valid JSON, keep the streamed text
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.error(e);
        }
      }
    });

    return new Response(outputStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
