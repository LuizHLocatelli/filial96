-- CRITICAL SECURITY FIX: Remove all policies that allow public access to customer data
-- The venda_o_sales table contains sensitive customer information (names, phones, addresses)

-- Remove the dangerous public policies that allow unrestricted access
DROP POLICY IF EXISTS "Users can view all sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Users can view all venda_o_sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Users can insert venda_o_sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Users can update venda_o_sales" ON public.venda_o_sales;
DROP POLICY IF EXISTS "Users can delete venda_o_sales" ON public.venda_o_sales;

-- These policies had "qual:true" which means ANY authenticated user could access ALL customer data
-- This is a critical security vulnerability that exposed customer personal information

-- The secure policies that remain are:
-- 1. "Users can view their own sales" - Only shows sales they created
-- 2. "Users can create sales" - Can only create with their own user ID
-- 3. "Users can update their own sales" - Can only update their own records
-- 4. "Users can delete their own sales" - Can only delete their own records
-- 5. "Users can manage their own sales" - Comprehensive policy for own records
-- 6. "Managers can view all sales" - Managers with 'gerente' role can view all
-- 7. "Managers can manage all sales" - Managers can manage all records

-- Verify RLS is still enabled (should already be enabled from previous migration)
ALTER TABLE public.venda_o_sales ENABLE ROW LEVEL SECURITY;

-- Add security audit comment
COMMENT ON TABLE public.venda_o_sales IS 'SECURED: Sales data with customer PII. Access restricted to record creators and managers only. Public access policies removed for security.';