import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface TrackingEvent {
  secao: string;
  acao: string;
  detalhes?: Record<string, any>;
  metadata?: {
    arquivo_id?: string;
    produto_id?: string;
    folga_id?: string;
    url_atual?: string;
    tempo_gasto?: number;
  };
}

export function useModaTracking() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (event: TrackingEvent) => {
    if (!user) return;

    try {
      // Sistema de tracking simplificado - apenas console log para desenvolvimento
      console.log('Moda Tracking Event:', {
        user_id: user.id,
        secao: event.secao,
        acao: event.acao,
        detalhes: event.detalhes,
        metadata: event.metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  }, [user]);

  // Funções específicas para cada seção
  const trackDiretorioEvent = useCallback((acao: string, arquivo?: any) => {
    trackEvent({
      secao: 'diretorio',
      acao,
      detalhes: arquivo ? {
        arquivo_nome: arquivo.nome || arquivo.name,
        arquivo_tipo: arquivo.tipo || arquivo.file_type,
        arquivo_tamanho: arquivo.tamanho || arquivo.file_size,
        categoria: arquivo.categoria || arquivo.category_id
      } : undefined,
      metadata: {
        arquivo_id: arquivo?.id,
        url_atual: window.location.pathname
      }
    });
  }, [trackEvent]);

  const trackProdutoFocoEvent = useCallback((acao: string, produto?: any) => {
    trackEvent({
      secao: 'produto-foco',
      acao,
      detalhes: produto ? {
        produto_nome: produto.nome_produto,
        produto_codigo: produto.codigo_produto,
        categoria: produto.categoria,
        preco_de: produto.preco_de,
        preco_por: produto.preco_por,
        meta_vendas: produto.meta_vendas
      } : undefined,
      metadata: {
        produto_id: produto?.id,
        url_atual: window.location.pathname
      }
    });
  }, [trackEvent]);

  const trackFolgasEvent = useCallback((acao: string, folga?: any) => {
    trackEvent({
      secao: 'folgas',
      acao,
      detalhes: folga ? {
        data: folga.data,
        consultor_id: folga.consultor_id,
        motivo: folga.motivo
      } : undefined,
      metadata: {
        folga_id: folga?.id,
        url_atual: window.location.pathname
      }
    });
  }, [trackEvent]);

  const trackNavigationEvent = useCallback((secao: string, acao: string = 'navegar') => {
    trackEvent({
      secao,
      acao,
      detalhes: {
        timestamp: new Date().toISOString(),
        origem: document.referrer || 'direto'
      },
      metadata: {
        url_atual: window.location.pathname + window.location.search
      }
    });
  }, [trackEvent]);

  const trackTimeSpent = useCallback((secao: string, tempoSegundos: number) => {
    trackEvent({
      secao,
      acao: 'tempo_gasto',
      detalhes: {
        duracao_segundos: tempoSegundos,
        data_hora: new Date().toISOString()
      },
      metadata: {
        tempo_gasto: tempoSegundos,
        url_atual: window.location.pathname
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackDiretorioEvent,
    trackProdutoFocoEvent,
    trackFolgasEvent,
    trackNavigationEvent,
    trackTimeSpent
  };
} 