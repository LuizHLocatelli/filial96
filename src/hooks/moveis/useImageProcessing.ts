import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProcessImageResponse, UseImageProcessingReturn } from '@/types/frete';
import { parseBrazilianNumber, formatForInput } from '@/utils/numberFormatter';

export function useImageProcessing(): UseImageProcessingReturn {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageUrl: string): Promise<ProcessImageResponse | null> => {
    try {
      setProcessing(true);
      setError(null);

      console.log('Iniciando processamento de imagem via Edge Function...');

      // Converter imagem para base64 para melhor compatibilidade
      let imageData = imageUrl;
      try {
        console.log('Convertendo imagem para base64...');
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });
        imageData = base64;
        console.log('Imagem convertida para base64 com sucesso');
      } catch (conversionError) {
        console.warn('Falha ao converter para base64, usando URL original:', conversionError);
        imageData = imageUrl;
      }

      // Chamar a Edge Function
      const startTime = Date.now();
      const { data: response, error: functionError } = await supabase.functions.invoke(
        'process-invoice-image',
        {
          body: {
            image_url: imageUrl,
            image_data: imageData.startsWith('data:') ? imageData : undefined,
          },
        }
      );

      const processingTime = Date.now() - startTime;

      if (functionError) {
        console.error('Erro na Edge Function:', functionError);
        throw new Error(functionError.message || 'Erro ao processar imagem');
      }

      if (!response) {
        throw new Error('Resposta vazia da função de processamento');
      }

      console.log('Resposta da Edge Function:', response);

      // Registrar log de processamento
      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('frete_processing_logs').insert({
          image_url: imageUrl,
          confidence_score: response.confidence || 0,
          processing_time_ms: processingTime,
          success: response.success,
          raw_response: JSON.stringify(response),
          error_message: response.error || null,
          extracted_data: response.data || null,
          created_by: userData.user?.id,
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
        // Não falhar por causa do log
      }

      if (!response.success) {
        setError(response.error || 'Erro desconhecido no processamento');
        toast({
          title: 'Erro no Processamento',
          description: response.error || 'Não foi possível processar a imagem da nota fiscal',
          variant: 'destructive',
        });
        return response;
      }

      // Verificar se obtivemos dados significativos
      const hasData = response.data && (
        response.data.cpf_cliente ||
        response.data.nome_cliente ||
        response.data.valor_total_nota ||
        (response.data.itens && response.data.itens.length > 0)
      );

      if (hasData) {
        const extractedItems = response.data.itens?.length || 0;
        const totalValue = response.data.valor_total_nota;
        const confidence = response.confidence || 0;

        let description = `Dados extraídos com ${confidence}% de confiança!`;
        if (extractedItems > 0 && totalValue) {
          // Converter valor brasileiro para número e formatar
          const numericValue = parseBrazilianNumber(totalValue);
          const formattedValue = numericValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          description += ` Encontrados ${extractedItems} item(ns) com valor total de ${formattedValue}.`;
        } else if (extractedItems > 0) {
          description += ` Encontrados ${extractedItems} item(ns).`;
        } else if (totalValue) {
          const numericValue = parseBrazilianNumber(totalValue);
          const formattedValue = numericValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          description += ` Valor total: ${formattedValue}.`;
        }

        toast({
          title: 'Sucesso',
          description: description,
        });
      } else {
        toast({
          title: 'Aviso',
          description: 'Não foi possível extrair dados significativos da nota fiscal. Verifique a qualidade da imagem e preencha os dados manualmente.',
          variant: 'default',
        });
      }

      return response;
    } catch (err) {
      console.error('Erro no processamento de imagem:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);

      toast({
        title: 'Erro',
        description: 'Erro inesperado ao processar imagem da nota fiscal',
        variant: 'destructive',
      });

      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processing,
    processImage,
    error,
  };
}