-- SECURITY FIX: Implement proper RLS policies for venda_o_sales table
-- This table contains sensitive customer personal information including names, phone numbers, and addresses

-- First, check if RLS is enabled on the table and enable it if not
ALTER TABLE public.venda_o_sales ENABLE ROW LEVEL SECURITY;

-- Remove any existing overly permissive policies if they exist
DROP POLICY IF EXISTS "Public read access" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Anyone can view sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "All users can view sales" ON public.venda_o_sales;

-- Implement secure RLS policies for venda_o_sales table

-- 1. Users can view their own sales records
CREATE POLICY "Users can view their own sales" ON public.venda_o_sales
FOR SELECT USING (auth.uid() = created_by);

-- 2. Users can create their own sales records
CREATE POLICY "Users can create their own sales" ON public.venda_o_sales
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 3. Users can update their own sales records
CREATE POLICY "Users can update their own sales" ON public.venda_o_sales
FOR UPDATE USING (auth.uid() = created_by);

-- 4. Users can delete their own sales records
CREATE POLICY "Users can delete their own sales" ON public.venda_o_sales
FOR DELETE USING (auth.uid() = created_by);

-- 5. Managers can view all sales records (if manager role functionality exists)
CREATE POLICY "Managers can view all sales" ON public.venda_o_sales
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'gerente'
  )
);

-- 6. Managers can manage all sales records
CREATE POLICY "Managers can manage all sales" ON public.venda_o_sales
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'gerente'
  )
);

-- Add documentation comment
COMMENT ON TABLE public.venda_o_sales IS 'Sales data table with RLS policies restricting access to record creators and managers only. Contains sensitive customer personal information including names, phone numbers, and addresses.';

-- Ensure created_by field is properly set for all existing records (if any exist without it)
-- This is a safety measure to prevent orphaned records
UPDATE public.venda_o_sales 
SET created_by = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
) 
WHERE created_by IS NULL;