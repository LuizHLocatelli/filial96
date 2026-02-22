import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerationResult {
  system_message: string;
  suggested_emoji: string;
}

export function useGenerateSystemMessage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (purpose: string, name: string, description: string): Promise<GenerationResult | null> => {
    setIsGenerating(true);
    try {
      const prompt = `Você é um engenheiro de prompt especialista. Crie uma 'system message' profissional, detalhada e impecável para um assistente de IA.
O usuário pediu o seguinte propósito/instrução: '${purpose}'.
O nome do assistente é: '${name || "Assistente Sem Nome"}'.
A descrição curta do assistente é: '${description || "Nenhuma"}'.

A system message deve ser clara, definir o tom de voz e ter no máximo 7500 caracteres para garantir que não exceda o limite.

IMPORTANTÍSSIMO: A system message gerada deve ser EXTREMAMENTE bem formatada.
Use quebras de linha duplas, listas com marcadores, negrito (Markdown) em tópicos principais, e seções claras (como "Papel", "Tom de Voz", "Restrições", "Diretrizes", etc.) para facilitar a leitura. Uma formatação excelente é fundamental.

Você também deve sugerir um ÚNICO caractere de EMOJI que represente bem esse assistente.

Retorne APENAS um objeto JSON válido, sem markdown (\`\`\`json), com exatamente estas duas chaves:
{
  "system_message": "O texto gerado da instrução muito bem formatado com quebras de linha (\\n)",
  "suggested_emoji": "🤖"
}`;

      const { data, error } = await supabase.functions.invoke("gemini-assistant-chat", {
        body: {
          message: prompt,
          systemMessage: "Você é um engenheiro de prompt de IA experiente que retorna apenas JSON válido sem formatação markdown.",
        }
      });

      if (error) throw error;
      if (!data?.text) throw new Error("A IA não retornou um texto válido");

      // Attempt to parse JSON response. The model might sometimes wrap it in markdown despite instructions.
      let jsonStr = data.text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const parsed: GenerationResult = JSON.parse(jsonStr);
      
      if (!parsed.system_message || !parsed.suggested_emoji) {
        throw new Error("Formato JSON retornado inválido");
      }

      return parsed;

    } catch (error) {
      console.error("Erro ao gerar system message:", error);
      toast.error("Erro ao gerar as instruções com IA");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating };
}
