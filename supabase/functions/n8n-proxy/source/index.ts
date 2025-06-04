import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const N8N_WEBHOOK_URL = "https://filial96.app.n8n.cloud/webhook/44a765ab-fb44-44c3-ab75-5ec334b9cda0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Resposta de fallback quando o N8N falha
const getFallbackResponse = (message: string): string => {
  const msg = message.toLowerCase();
  
  if (msg.includes("olá") || msg.includes("oi") || msg.includes("bom dia") || msg.includes("boa tarde")) {
    return "Olá! Sou seu assistente de produtividade. Como posso ajudar você hoje?";
  }
  
  if (msg.includes("ajuda") || msg.includes("help")) {
    return "Estou aqui para ajudar! Posso responder perguntas sobre rotinas, tarefas, produtividade e navegação no Hub.";
  }
  
  if (msg.includes("produtividade") || msg.includes("produtivo")) {
    return "Dicas para aumentar sua produtividade:\n• Use a técnica Pomodoro\n• Priorize tarefas importantes\n• Elimine distrações\n• Faça pausas regulares";
  }
  
  return "Desculpe, estou com dificuldades para processar sua solicitação no momento. Tente novamente ou reformule sua pergunta.";
};

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[${requestId}] ${req.method} request received from: ${req.headers.get('origin') || 'unknown'}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`);
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[${requestId}] Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse the request body
    const body = await req.json();
    console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.message) {
      console.log(`[${requestId}] Missing message field in request body`);
      return new Response(
        JSON.stringify({ 
          error: 'Missing message field',
          fallback_response: getFallbackResponse("ajuda")
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Forward the request to N8N with timeout
    console.log(`[${requestId}] Forwarding request to N8N: ${N8N_WEBHOOK_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`[${requestId}] N8N responded with status: ${response.status}`);
      
      // Check if N8N response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] N8N error response:`, errorText);
        
        // Provide fallback response when N8N fails
        const fallbackResponse = getFallbackResponse(body.message);
        console.log(`[${requestId}] Using fallback response due to N8N error`);
        
        return new Response(
          JSON.stringify({ 
            message: fallbackResponse,
            source: "fallback",
            debug: {
              n8n_status: response.status,
              n8n_error: errorText,
              original_message: body.message
            }
          }),
          {
            status: 200, // Return 200 even if N8N failed, since we have fallback
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // Parse N8N response
      const data = await response.json();
      console.log(`[${requestId}] N8N response data:`, JSON.stringify(data, null, 2));
      
      // Return the response with CORS headers
      return new Response(
        JSON.stringify(data),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error(`[${requestId}] Fetch error:`, fetchError);
      
      // Handle specific error types
      let errorType = 'unknown';
      if (fetchError.name === 'AbortError') {
        errorType = 'timeout';
        console.log(`[${requestId}] Request timed out after 10 seconds`);
      } else if (fetchError.message?.includes('network')) {
        errorType = 'network';
        console.log(`[${requestId}] Network error occurred`);
      }
      
      // Provide fallback response when fetch fails
      const fallbackResponse = getFallbackResponse(body.message);
      console.log(`[${requestId}] Using fallback response due to fetch error: ${errorType}`);
      
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          source: "fallback",
          debug: {
            error_type: errorType,
            error_message: fetchError.message,
            original_message: body.message
          }
        }),
        {
          status: 200, // Return 200 even if fetch failed, since we have fallback
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error);
    
    // Even for unexpected errors, try to provide a fallback
    const fallbackResponse = "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.";
    
    return new Response(
      JSON.stringify({ 
        message: fallbackResponse,
        source: "fallback",
        debug: {
          error_type: 'unexpected',
          error_message: error.message,
          stack: error.stack
        }
      }),
      {
        status: 200, // Return 200 to prevent client-side errors
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}); 