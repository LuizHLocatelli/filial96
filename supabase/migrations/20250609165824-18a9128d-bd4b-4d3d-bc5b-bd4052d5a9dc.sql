
-- Criar tabela para reservas de moda
CREATE TABLE public.moda_reservas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_nome VARCHAR NOT NULL,
  produto_codigo VARCHAR NOT NULL,
  tamanho VARCHAR,
  quantidade INTEGER NOT NULL,
  cliente_nome VARCHAR NOT NULL,
  cliente_cpf VARCHAR NOT NULL,
  consultora_id UUID NOT NULL,
  forma_pagamento VARCHAR NOT NULL CHECK (forma_pagamento IN ('crediario', 'cartao_credito', 'cartao_debito', 'pix')),
  data_reserva TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'convertida', 'cancelada')),
  venda_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.moda_reservas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own reservas" 
  ON public.moda_reservas 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own reservas" 
  ON public.moda_reservas 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own reservas" 
  ON public.moda_reservas 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own reservas" 
  ON public.moda_reservas 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Índices para performance
CREATE INDEX idx_moda_reservas_status ON public.moda_reservas(status);
CREATE INDEX idx_moda_reservas_data_expiracao ON public.moda_reservas(data_expiracao);
CREATE INDEX idx_moda_reservas_consultora_id ON public.moda_reservas(consultora_id);
CREATE INDEX idx_moda_reservas_created_by ON public.moda_reservas(created_by);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_moda_reservas_updated_at
  BEFORE UPDATE ON public.moda_reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para definir data de expiração automaticamente (72 horas)
CREATE OR REPLACE FUNCTION set_moda_reserva_expiracao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_expiracao := NEW.data_reserva + INTERVAL '72 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir data de expiração na criação
CREATE TRIGGER set_expiracao_before_insert
  BEFORE INSERT ON public.moda_reservas
  FOR EACH ROW
  EXECUTE FUNCTION set_moda_reserva_expiracao();
