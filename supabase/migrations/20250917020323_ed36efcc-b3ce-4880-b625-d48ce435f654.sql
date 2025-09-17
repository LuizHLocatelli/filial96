-- SECURITY FIX: Implement proper RLS policies for venda_o_sales table
-- First check current state and implement missing security policies

-- Enable RLS if not already enabled
ALTER TABLE public.venda_o_sales ENABLE ROW LEVEL SECURITY;

-- Remove any existing overly permissive policies that allow public access
DROP POLICY IF EXISTS "Public read access" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Anyone can view sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "All users can view sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.venda_o_sales;

-- Check if secure policies exist, if not create them
-- Policy for users to view their own sales (if doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'venda_o_sales' 
        AND policyname = 'Users can view their own sales'
    ) THEN
        CREATE POLICY "Users can view their own sales" ON public.venda_o_sales
        FOR SELECT USING (auth.uid() = created_by);
    END IF;
END $$;

-- Policy for managers to view all sales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'venda_o_sales' 
        AND policyname = 'Managers can view all sales'
    ) THEN
        CREATE POLICY "Managers can view all sales" ON public.venda_o_sales
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'gerente'
          )
        );
    END IF;
END $$;

-- Policy for managers to manage all sales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'venda_o_sales' 
        AND policyname = 'Managers can manage all sales'
    ) THEN
        CREATE POLICY "Managers can manage all sales" ON public.venda_o_sales
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'gerente'
          )
        );
    END IF;
END $$;

-- Add security documentation
COMMENT ON TABLE public.venda_o_sales IS 'Sales data table with RLS policies restricting access to record creators and managers only. Contains sensitive customer personal information.';