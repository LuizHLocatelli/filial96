-- Create escala_carga table
CREATE TABLE IF NOT EXISTS public.escala_carga (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_carga BOOLEAN NOT NULL DEFAULT false,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, user_id)
);

-- Add index for faster queries by date and user
CREATE INDEX IF NOT EXISTS idx_escala_carga_date ON public.escala_carga(date);
CREATE INDEX IF NOT EXISTS idx_escala_carga_user_id ON public.escala_carga(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.escala_carga ENABLE ROW LEVEL SECURITY;

-- Create policies

-- 1. Everyone can view the schedule (Select)
CREATE POLICY "Everyone can view the schedule"
    ON public.escala_carga
    FOR SELECT
    USING (true);

-- 2. Only managers can insert schedules
CREATE POLICY "Only managers can insert schedules"
    ON public.escala_carga
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'gerente'
        )
    );

-- 3. Only managers can update schedules
CREATE POLICY "Only managers can update schedules"
    ON public.escala_carga
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'gerente'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'gerente'
        )
    );

-- 4. Only managers can delete schedules
CREATE POLICY "Only managers can delete schedules"
    ON public.escala_carga
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'gerente'
        )
    );

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_escala_carga_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_escala_carga_timestamp
    BEFORE UPDATE ON public.escala_carga
    FOR EACH ROW
    EXECUTE FUNCTION update_escala_carga_updated_at();

-- Add a comment to the table
COMMENT ON TABLE public.escala_carga IS 'Tabela para armazenar as escalas de carga e horários dos consultores de móveis.';
