import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const GCP_PROJECT_ID = Deno.env.get("GCP_PROJECT_ID");
const GCP_LOCATION = Deno.env.get("GCP_LOCATION") || "us-central1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

interface RequestBody {
  message: string;
  imageData?: string;
  conversationHistory?: any[];
  configId: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const { message, imageData, conversationHistory, configId, userId } = await req.json() as RequestBody;

    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not set");
    if (!GCP_PROJECT_ID) throw new Error("GCP_PROJECT_ID is not set");

    // 1. Fetch Agent Config
    const { data: config, error: configError } = await supabase
      .from("agente_multimodal_config")
      .select("*")
      .eq("id", configId)
      .single();

    if (configError || !config) throw new Error("Agent configuration not found");

    // 2. Analyze Intent
    const analysis = await analyzeIntent(message, config.system_prompt, GOOGLE_API_KEY);

    // 3. Generate Text Response with Gemini 3 Flash
    const textResponse = await callGemini(message, imageData, conversationHistory, config.system_prompt, GOOGLE_API_KEY);

    let videoResult = null;

    if (analysis.shouldGenerateVideo && analysis.videoPrompt) {
      // 4. Generate Video with Veo 3.1 Fast using Vertex AI
      console.log("Generating video for prompt:", analysis.videoPrompt);
      videoResult = await generateVideoWithVeo(
        analysis.videoPrompt,
        userId,
        GOOGLE_API_KEY,
        GCP_PROJECT_ID,
        GCP_LOCATION,
        supabase
      );

      // 5. Save video metadata
      if (videoResult) {
        await supabase.from("agente_multimodal_videos").insert({
          user_id: userId,
          prompt: analysis.videoPrompt,
          video_url: videoResult.url,
          status: "completed",
          video_duration_seconds: 8,
          aspect_ratio: "16:9"
        });
      }
    }

    return new Response(
      JSON.stringify({
        response: textResponse,
        video: videoResult,
        intent: {
          isVideoRequest: analysis.shouldGenerateVideo,
          confidence: analysis.confidence,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function analyzeIntent(message: string, systemPrompt: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const prompt = `
    Analyze the user message and decide if a video should be generated.
    User Message: "${message}"
    
    Return ONLY JSON:
    {
      "shouldGenerateVideo": boolean,
      "videoPrompt": "detailed visual prompt for Veo 3.1 Fast",
      "confidence": number
    }
  `;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error("Unexpected Gemini response:", JSON.stringify(data));
    return { shouldGenerateVideo: false, videoPrompt: null, confidence: 0 };
  }
  
  try {
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error("Failed to parse intent response:", data.candidates[0].content.parts[0].text);
    return { shouldGenerateVideo: false, videoPrompt: null, confidence: 0 };
  }
}

async function callGemini(message: string, imageData: string | undefined, history: any[] | undefined, systemPrompt: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const contents = history || [];
  const userParts: any[] = [{ text: message }];
  
  if (imageData) {
    const base64Data = imageData.split(",")[1] || imageData;
    userParts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }
  
  contents.push({ role: "user", parts: userParts });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error("Unexpected Gemini response:", JSON.stringify(data));
    throw new Error("Invalid response from Gemini API");
  }
  
  return data.candidates[0].content.parts[0].text;
}

async function generateVideoWithVeo(
  prompt: string, 
  userId: string, 
  apiKey: string, 
  projectId: string,
  location: string,
  supabase: any
) {
  // Vertex AI API endpoint for Veo 3.1
  const baseUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}`;
  const modelUrl = `${baseUrl}/publishers/google/models/veo-3.1-fast:predictLongRunning`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
      }
    ],
    parameters: {
      aspectRatio: "16:9",
      sampleCount: 1,
      durationSeconds: 8,
    }
  };

  console.log("Calling Vertex AI Veo API:", modelUrl);
  
  const res = await fetch(`${modelUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Veo API error:", errorText);
    throw new Error(`Veo API error: ${res.status} - ${errorText}`);
  }

  const operationData = await res.json();
  console.log("Operation started:", operationData.name);

  // Poll for operation completion
  const operationName = operationData.name;
  let videoUri = null;
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes (5 seconds * 120)

  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
    
    const statusUrl = `https://${location}-aiplatform.googleapis.com/v1/${operationName}?key=${apiKey}`;
    const statusRes = await fetch(statusUrl);
    const statusData = await statusRes.json();
    
    console.log(`Status check ${attempts}:`, statusData.done ? "done" : "processing");

    if (statusData.done) {
      if (statusData.error) {
        throw new Error(`Video generation failed: ${statusData.error.message}`);
      }
      
      // Extract video URI from response
      videoUri = statusData.response?.generatedVideos?.[0]?.video?.uri ||
                 statusData.response?.videos?.[0]?.uri ||
                 statusData.response?.videoUri;
                 
      if (videoUri) break;
    }
  }

  if (!videoUri) throw new Error("Video generation timed out after 10 minutes");
  console.log("Video generated, downloading from:", videoUri);

  // Download video from GCS URI or HTTP URL
  let videoData: Blob;
  
  if (videoUri.startsWith("gs://")) {
    // If it's a GCS URI, we need to use the GCS API to get the object
    // For now, we'll construct a public URL if the bucket is public
    // Or use a signed URL approach
    console.log("Video stored in GCS:", videoUri);
    
    // Extract bucket and object name
    const gcsMatch = videoUri.match(/gs:\/\/([^\/]+)\/(.+)/);
    if (gcsMatch) {
      const bucket = gcsMatch[1];
      const object = gcsMatch[2];
      
      // Try to get the object via GCS JSON API
      const gcsUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(object)}?alt=media&key=${apiKey}`;
      const videoRes = await fetch(gcsUrl);
      
      if (!videoRes.ok) {
        throw new Error(`Failed to download video from GCS: ${videoRes.status}`);
      }
      
      videoData = await videoRes.blob();
    } else {
      throw new Error("Invalid GCS URI format");
    }
  } else {
    // HTTP URL
    const videoRes = await fetch(videoUri);
    if (!videoRes.ok) {
      throw new Error(`Failed to download video: ${videoRes.status}`);
    }
    videoData = await videoRes.blob();
  }

  const fileName = `${userId}/${Date.now()}.mp4`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("agente-videos")
    .upload(fileName, videoData, { contentType: "video/mp4" });

  if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("agente-videos").getPublicUrl(fileName);
  console.log("Video ready:", publicUrl);

  return { url: publicUrl, id: uploadData.path };
}
