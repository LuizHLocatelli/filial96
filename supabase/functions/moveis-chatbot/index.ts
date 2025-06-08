
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para delay entre tentativas
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para fazer retry com backoff exponencial
async function makeOpenAIRequest(messages: any[], retries = 3): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Tentativa ${attempt + 1} de ${retries} para OpenAI API`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      // Se for erro 429 (rate limit), aguarda e tenta novamente
      if (response.status === 429) {
        console.log(`Rate limit atingido. Aguardando ${(attempt + 1) * 2} segundos...`);
        await delay((attempt + 1) * 2000); // 2s, 4s, 6s
        continue;
      }

      // Para outros erros HTTP, não faz retry
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      
      // Se for o último retry, relança o erro
      if (attempt === retries - 1) {
        throw error;
      }
      
      // Aguarda antes da próxima tentativa
      await delay((attempt + 1) * 1000);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando processamento da requisição do chatbot');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({ 
        error: 'Chave da API OpenAI não configurada',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversationHistory = [] } = await req.json();
    console.log('Mensagem recebida:', message);

    if (!message || message.trim() === '') {
      return new Response(JSON.stringify({ 
        error: 'Mensagem não pode estar vazia',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `Você é um assistente especializado do setor de móveis. Suas principais funções são:

1. 📝 Gerar legendas promocionais criativas para produtos de móveis
2. 🛋️ Responder dúvidas sobre produtos e características
3. 💡 Auxiliar com dúvidas gerais relacionadas ao setor

Diretrizes:
- Sempre responda em português brasileiro
- Seja cordial, profissional e prestativo
- Para legendas promocionais, seja criativo e use emojis quando apropriado
- Mantenha respostas concisas mas informativas
- Foque em móveis, decoração e design de interiores`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Limita histórico para evitar tokens excessivos
      { role: 'user', content: message }
    ];

    console.log('Fazendo requisição para OpenAI...');
    const data = await makeOpenAIRequest(messages);
    
    const botResponse = data.choices[0].message.content;
    console.log('Resposta recebida da OpenAI');

    return new Response(JSON.stringify({ 
      response: botResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função moveis-chatbot:', error);
    
    // Mensagem de erro mais amigável baseada no tipo de erro
    let errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
    
    if (error.message?.includes('429')) {
      errorMessage = 'Muitas requisições. Aguarde alguns segundos e tente novamente.';
    } else if (error.message?.includes('OpenAI')) {
      errorMessage = 'Erro na API da OpenAI. Tente novamente em alguns instantes.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
