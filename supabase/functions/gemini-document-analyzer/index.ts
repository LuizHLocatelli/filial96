import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  action: "summarize" | "chat";
  fileId?: string; // UUID of the gerencial_arquivos row
  fileUrl?: string; // Direct public URL if no fileId is provided
  fileName?: string;
  message?: string; // Used for "chat" action
  history?: ChatMessage[]; // Used for "chat" action
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { action, fileId, fileUrl, fileName, message, history } = body;

    if (!action) {
      throw new Error("Action is required ('summarize' or 'chat')");
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    // Determine the target file URL
    let targetUrl = fileUrl;
    let targetFileName = fileName || "Documento";

    if (fileId) {
       // Fetch the file path from the database
       const { data, error } = await supabase
          .from('gerencial_arquivos')
          .select('caminho_storage, nome_arquivo')
          .eq('id', fileId)
          .single();
       
       if (error || !data) {
          throw new Error("File not found in database: " + error?.message);
       }

       // Get public URL
       const { data: { publicUrl } } = supabase.storage
          .from('diretorio_gerencial')
          .getPublicUrl(data.caminho_storage);
       
       targetUrl = publicUrl;
       targetFileName = data.nome_arquivo;
    }

    if (!targetUrl) {
       throw new Error("fileUrl or fileId must be provided");
    }

    // Since we can't reliably pass URLs directly to Gemini Vision API if they aren't Google Cloud Storage,
    // we need to download the file and send it as base64 inline data for images, 
    // or extract text if it's a PDF.
    
    // In this edge function, we'll implement a basic structure that can handle textual requests based on the prompt.
    // Full PDF parsing would require a library like pdf.js, but since Gemini 1.5 Pro natively supports file uploads,
    // we will simulate the integration by focusing on the text extraction and generation based on metadata if actual file reading fails.
    // Note: To fully support PDFs in Edge Functions we need to use a specialized library or use the Gemini File API.
    // For this prototype, if it's an image, we can fetch it and convert to base64. 
    // If it's a PDF, we'll try to use a text-based prompt or fallback to generic responses.

    console.log(`Processing action: ${action} for file: ${targetFileName}`);

    let fileParts: MessagePart[] = [];
    
    // Try to fetch the file to see if it's an image
    const fileRes = await fetch(targetUrl);
    if (!fileRes.ok) {
       throw new Error(`Failed to fetch file from ${targetUrl}`);
    }
    
    const contentType = fileRes.headers.get("content-type") || "";
    
    if (contentType.startsWith("image/")) {
       const arrayBuffer = await fileRes.arrayBuffer();
       const uint8Array = new Uint8Array(arrayBuffer);
       // Convert Uint8Array to binary string
       let binaryString = "";
       for (let i = 0; i < uint8Array.length; i++) {
           binaryString += String.fromCharCode(uint8Array[i]);
       }
       const base64Data = btoa(binaryString);
       
       fileParts.push({
          inlineData: {
             mimeType: contentType,
             data: base64Data
          }
       });
       console.log(`Loaded image with mimeType: ${contentType}`);
    } else if (contentType === "application/pdf") {
       // For PDFs, we can try to send it as inlineData if the model supports it.
       // Gemini 1.5 Flash supports PDF inline data!
       const arrayBuffer = await fileRes.arrayBuffer();
       const uint8Array = new Uint8Array(arrayBuffer);
       let binaryString = "";
       for (let i = 0; i < uint8Array.length; i++) {
           binaryString += String.fromCharCode(uint8Array[i]);
       }
       const base64Data = btoa(binaryString);
       
       fileParts.push({
          inlineData: {
             mimeType: "application/pdf",
             data: base64Data
          }
       });
       console.log(`Loaded PDF for analysis`);
    } else {
       // Fallback for unsupported types
       fileParts.push({
          text: `[O conteúdo deste arquivo não pôde ser carregado diretamente pela IA. O nome do arquivo é: ${targetFileName}. Tipo: ${contentType}]`
       });
    }

    const chatModelName = "gemini-3-flash-preview";
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chatModelName}:generateContent?key=${GEMINI_API_KEY}`;

    let contents: ChatMessage[] = [];
    let systemInstruction = "Você é um assistente de IA focado em análise de documentos para gerentes. Responda em português.";

    if (action === "summarize") {
       systemInstruction += " Sua tarefa atual é gerar um breve resumo executivo e sugerir tags para o documento fornecido.";
       
       const summarizePrompt = `Por favor, analise este documento (${targetFileName}) e me dê duas coisas no formato JSON exato:
1. "resumo": Um resumo executivo bem direto, com no máximo 3 frases curtas.
2. "tags": Um array de strings com 2 a 4 tags relevantes que categorizem o documento (ex: ["Contrato", "RH", "2024"]).

Retorne APENAS o JSON válido, sem markdown (\`\`\`) ao redor, para que possa ser feito o parse diretamente.`;
       
       contents = [
          { 
             role: "user", 
             parts: [
                ...fileParts,
                { text: summarizePrompt }
             ] 
          }
       ];

    } else if (action === "chat") {
       systemInstruction += " Sua tarefa atual é responder às perguntas do gerente sobre o documento fornecido.";
       
       if (!message) {
          throw new Error("Message is required for chat action");
       }

       // Format history and append the new message
       const previousHistory = history || [];
       contents = [...previousHistory];
       
       // Append the document context to the first message if history is empty,
       // otherwise append it to the current message to ensure the model has context.
       // Actually, it's better to always send the document in the current turn for stateless APIs if the context window allows, 
       // but for efficiency, we might just include it once. Let's include it in the current message.
       
       contents.push({
          role: "user",
          parts: [
             ...fileParts,
             { text: `Sobre o documento "${targetFileName}": ${message}` }
          ]
       });
    }

    console.log(`Calling Chat Model (${chatModelName}) for action ${action}...`);
    const chatRes = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: { temperature: 0.2 } // Lower temperature for more factual responses
      })
    });

    if (!chatRes.ok) {
      const err = await chatRes.text();
      console.error(`Chat API error: ${err}`);
      throw new Error(`Chat API error: ${err}`);
    }

    const chatData = await chatRes.json();
    let generatedText = chatData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No text generated by Gemini API");
    }

    if (action === "summarize") {
       // Clean up possible markdown in JSON response
       let jsonStr = generatedText.trim();
       if (jsonStr.startsWith("```json")) {
           jsonStr = jsonStr.replace(/```json/g, "");
           jsonStr = jsonStr.replace(/```/g, "");
       } else if (jsonStr.startsWith("```")) {
           jsonStr = jsonStr.replace(/```/g, "");
       }
       
       try {
           const parsedData = JSON.parse(jsonStr.trim());
           
           // If we have a fileId, update the database with the generated summary and tags
           if (fileId && parsedData.resumo && parsedData.tags) {
               console.log(`Updating database for file ${fileId}...`);
               const { error: updateError } = await supabase
                  .from('gerencial_arquivos')
                  .update({
                      resumo_ia: parsedData.resumo,
                      tags: parsedData.tags
                  })
                  .eq('id', fileId);
                  
               if (updateError) {
                   console.error("Failed to update database with summary:", updateError);
               }
           }
           
           return new Response(
             JSON.stringify({ success: true, data: parsedData }),
             { headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
       } catch (e) {
           console.error("Failed to parse JSON summary:", e, jsonStr);
           return new Response(
             JSON.stringify({ success: false, error: "Failed to parse summary JSON", rawText: generatedText }),
             { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
           );
       }
    } else {
       // Return chat response
       return new Response(
         JSON.stringify({ text: generatedText }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
    }

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
