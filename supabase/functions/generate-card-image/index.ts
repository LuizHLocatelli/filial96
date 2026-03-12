import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { productName, productDescription, promoDetails, style, aspectRatio, referenceImageBase64 } = await req.json();

    if (!productName) {
      return new Response(JSON.stringify({ error: "Nome do produto é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dimensionGuide = aspectRatio === "1:1"
      ? "quadrado (1:1), 2048x2048 pixels"
      : "vertical retrato (4:5), 2048x2560 pixels";

    const systemPrompt = `Você é um designer gráfico profissional especializado em materiais promocionais para varejo.
Crie um card promocional visualmente impactante e profissional com as seguintes diretrizes:
- Formato: ${dimensionGuide}
- Use cores vibrantes e atrativas que chamem atenção
- Inclua o nome do produto de forma destacada e legível
- Se houver preço ou desconto, destaque com fontes grandes e cores contrastantes
- Use elementos gráficos modernos como gradientes, sombras e formas geométricas
- O texto deve ser claro, legível e bem posicionado
- Evite poluição visual - mantenha o design limpo mas impactante
- Crie um layout profissional de loja/varejo
- NÃO inclua texto cortado ou ilegível`;

    let userPrompt = `Crie um card promocional para o seguinte produto:

**Produto:** ${productName}`;

    if (productDescription) {
      userPrompt += `\n**Descrição:** ${productDescription}`;
    }

    if (promoDetails) {
      userPrompt += `\n**Promoção/Detalhes:** ${promoDetails}`;
    }

    if (style) {
      userPrompt += `\n**Estilo desejado:** ${style}`;
    }

    userPrompt += `\n\nFormato do card: ${dimensionGuide}. Crie um design profissional, moderno e atrativo para divulgação em redes sociais e WhatsApp.`;

    // Build messages array
    const userContent: any[] = [];

    if (referenceImageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: referenceImageBase64 },
      });
      userPrompt += `\n\nUse a imagem de referência fornecida como base visual do produto. Crie o card promocional incorporando esse produto de forma criativa no design.`;
    }

    userContent.push({ type: "text", text: userPrompt });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        modalities: ["image", "text"],
        reasoning_effort: "high",
        thinking: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Erro ao gerar imagem com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "A IA não retornou uma imagem. Tente reformular o pedido." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageBase64: imageUrl, description: textContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-card-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
