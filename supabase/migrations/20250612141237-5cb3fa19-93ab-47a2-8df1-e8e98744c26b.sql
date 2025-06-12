-- Criar tabela para categorias de metas
CREATE TABLE public.metas_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  cor VARCHAR(20) DEFAULT '#22c55e',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.metas_categorias (nome, descricao, icone, cor, ordem) VALUES
('Geral', 'Todas as metas da filial agrupadas', 'target', '#22c55e', 1),
('Eletromóveis', 'Meta principal dos Consultores de Móveis', 'sofa', '#3b82f6', 2),
('Moda', 'Meta principal das Consultoras de Moda', 'shirt', '#ec4899', 3),
('Garantia Estendida', 'Meta secundária dos Consultores de Móveis', 'shield-check', '#8b5cf6', 4),
('RFQ', 'Meta secundária dos Consultores de Móveis', 'file-text', '#f59e0b', 5),
('Seguro Móveis', 'Meta secundária dos Consultores de Móveis', 'home', '#06b6d4', 6),
('Seguro Moda', 'Meta secundária das Consultoras de Moda', 'heart-handshake', '#ef4444', 7),
('Empréstimo Pessoal', 'Meta principal das Crediaristas', 'banknote', '#10b981', 8);

-- Criar tabela para metas mensais
CREATE TABLE public.metas_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES public.metas_categorias(id) ON DELETE CASCADE,
  mes_ano DATE NOT NULL, -- Primeiro dia do mês/ano
  valor_meta NUMERIC(15,2) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(categoria_id, mes_ano)
);

-- Criar tabela para metas individuais dos funcionários
CREATE TABLE public.metas_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.metas_categorias(id) ON DELETE CASCADE,
  mes_ano DATE NOT NULL,
  valor_meta NUMERIC(15,2) NOT NULL,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(funcionario_id, categoria_id, mes_ano)
);

-- Criar tabela para Meta Foco
CREATE TABLE public.metas_foco (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_foco DATE NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.metas_categorias(id) ON DELETE CASCADE,
  valor_meta NUMERIC(15,2) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.metas_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_foco ENABLE ROW LEVEL SECURITY;

-- Políticas para metas_categorias (todos podem ver)
CREATE POLICY "Todos podem visualizar categorias de metas" ON public.metas_categorias
  FOR SELECT USING (true);

-- Políticas para metas_mensais
CREATE POLICY "Todos podem visualizar metas mensais" ON public.metas_mensais
  FOR SELECT USING (true);

CREATE POLICY "Gerentes podem gerenciar metas mensais" ON public.metas_mensais
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- Políticas para metas_funcionarios
CREATE POLICY "Funcionários podem ver suas próprias metas" ON public.metas_funcionarios
  FOR SELECT USING (
    funcionario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

CREATE POLICY "Gerentes podem gerenciar metas de funcionários" ON public.metas_funcionarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- Políticas para metas_foco
CREATE POLICY "Todos podem visualizar metas foco" ON public.metas_foco
  FOR SELECT USING (true);

CREATE POLICY "Gerentes podem gerenciar metas foco" ON public.metas_foco
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- Criar função para obter dados do dashboard de metas
CREATE OR REPLACE FUNCTION get_metas_dashboard_data(mes_ref DATE DEFAULT date_trunc('month', NOW())::date)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  WITH categorias_com_metas AS (
    SELECT 
      c.id,
      c.nome,
      c.descricao,
      c.icone,
      c.cor,
      c.ordem,
      COALESCE(mm.valor_meta, 0) as valor_meta_mensal,
      mm.id as meta_mensal_id
    FROM public.metas_categorias c
    LEFT JOIN public.metas_mensais mm ON c.id = mm.categoria_id AND mm.mes_ano = mes_ref
    WHERE c.ativo = true
    ORDER BY c.ordem
  ),
  metas_funcionarios_mes AS (
    SELECT 
      mf.categoria_id,
      json_agg(
        json_build_object(
          'funcionario_id', p.id,
          'funcionario_nome', p.name,
          'funcionario_role', p.role,
          'valor_meta', mf.valor_meta,
          'observacoes', mf.observacoes
        )
      ) as funcionarios_metas
    FROM public.metas_funcionarios mf
    JOIN public.profiles p ON mf.funcionario_id = p.id
    WHERE mf.mes_ano = mes_ref AND mf.ativo = true
    GROUP BY mf.categoria_id
  ),
  meta_foco_ativa AS (
    SELECT 
      mf.*
    FROM public.metas_foco mf
    WHERE mf.data_foco = CURRENT_DATE AND mf.ativo = true
    ORDER BY mf.created_at DESC
    LIMIT 1
  )
  SELECT json_build_object(
    'categorias', (
      SELECT json_agg(
        json_build_object(
          'id', cm.id,
          'nome', cm.nome,
          'descricao', cm.descricao,
          'icone', cm.icone,
          'cor', cm.cor,
          'ordem', cm.ordem,
          'valor_meta_mensal', cm.valor_meta_mensal,
          'meta_mensal_id', cm.meta_mensal_id,
          'funcionarios_metas', COALESCE(mfm.funcionarios_metas, '[]'::json)
        )
      )
      FROM categorias_com_metas cm
      LEFT JOIN metas_funcionarios_mes mfm ON cm.id = mfm.categoria_id
    ),
    'meta_foco_ativa', (
      SELECT
        json_build_object(
          'id', mfa.id,
          'data_foco', mfa.data_foco,
          'categoria_id', mfa.categoria_id,
          'categoria_nome', c.nome,
          'categoria_icone', c.icone,
          'categoria_cor', c.cor,
          'valor_meta', mfa.valor_meta,
          'titulo', mfa.titulo,
          'descricao', mfa.descricao
        )
      FROM meta_foco_ativa mfa
      LEFT JOIN public.metas_categorias c ON mfa.categoria_id = c.id
    ),
    'mes_referencia', mes_ref
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE public.metas_categorias IS 'Categorias de metas da filial';
COMMENT ON TABLE public.metas_mensais IS 'Metas mensais por categoria';
COMMENT ON TABLE public.metas_funcionarios IS 'Metas individuais dos funcionários';
COMMENT ON TABLE public.metas_foco IS 'Metas foco para dias específicos';
COMMENT ON FUNCTION get_metas_dashboard_data(DATE) IS 'Obtém todos os dados do dashboard de metas para um mês específico';
