CREATE TABLE public.consultant_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  monthly_goal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (consultant_id, goal_id)
);

COMMENT ON TABLE public.consultant_goals IS 'Metas mensais individuais para cada consultor.';
COMMENT ON COLUMN public.consultant_goals.consultant_id IS 'ID do consultor (referencia public.profiles).';
COMMENT ON COLUMN public.consultant_goals.goal_id IS 'ID da meta principal do setor (referencia public.goals).';
COMMENT ON COLUMN public.consultant_goals.monthly_goal IS 'Valor da meta mensal individual do consultor.'; 