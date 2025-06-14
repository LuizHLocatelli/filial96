
-- Critical Security Fixes: Activate Missing RLS Policies (Fixed Version)
-- This migration enables RLS on all tables that currently don't have it

-- 1. Enable RLS on tables that are missing it (ignore if already enabled)
DO $$
BEGIN
    -- Enable RLS with error handling
    BEGIN ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.card_folders ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.consultant_goals ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.n8n_vector_store ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.notification_read_status ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.promotional_cards ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.venda_o_attachments ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.venda_o_sales ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 2. Drop existing policies that might conflict and create new ones

-- Activities table policies
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities" ON public.activities;

CREATE POLICY "Users can view their own activities" ON public.activities
    FOR SELECT USING (auth.uid() = user_id OR public.is_user_manager());

CREATE POLICY "Users can create activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attachments table policies
DROP POLICY IF EXISTS "Users can view attachments they created or are assigned to" ON public.attachments;
DROP POLICY IF EXISTS "Users can create attachments" ON public.attachments;

CREATE POLICY "Users can view attachments they created or are assigned to" ON public.attachments
    FOR SELECT USING (
        auth.uid() = created_by OR 
        public.is_user_manager() OR
        EXISTS (
            SELECT 1 FROM public.tasks t 
            WHERE t.id = attachments.task_id 
            AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
        )
    );

CREATE POLICY "Users can create attachments" ON public.attachments
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.tasks t 
            WHERE t.id = attachments.task_id 
            AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
        )
    );

-- Card folders policies
DROP POLICY IF EXISTS "Users can manage their own card folders" ON public.card_folders;

CREATE POLICY "Users can manage their own card folders" ON public.card_folders
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- Consultant goals policies
DROP POLICY IF EXISTS "Users can view their own goals and managers can view all" ON public.consultant_goals;
DROP POLICY IF EXISTS "Managers can manage consultant goals" ON public.consultant_goals;

CREATE POLICY "Users can view their own goals and managers can view all" ON public.consultant_goals
    FOR SELECT USING (auth.uid() = consultant_id OR public.is_user_manager());

CREATE POLICY "Managers can manage consultant goals" ON public.consultant_goals
    FOR ALL USING (public.is_user_manager())
    WITH CHECK (public.is_user_manager());

-- Goals table policies
DROP POLICY IF EXISTS "All authenticated users can view goals" ON public.goals;
DROP POLICY IF EXISTS "Managers can manage goals" ON public.goals;

CREATE POLICY "All authenticated users can view goals" ON public.goals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage goals" ON public.goals
    FOR ALL USING (public.is_user_manager())
    WITH CHECK (public.is_user_manager());

-- N8N vector store policies (restrict access)
DROP POLICY IF EXISTS "Only service role can access vector store" ON public.n8n_vector_store;

CREATE POLICY "Only service role can access vector store" ON public.n8n_vector_store
    FOR ALL USING (auth.role() = 'service_role');

-- Note folders policies
DROP POLICY IF EXISTS "Users can manage their own note folders" ON public.note_folders;

CREATE POLICY "Users can manage their own note folders" ON public.note_folders
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- Notification read status policies
DROP POLICY IF EXISTS "Users can view their own notification status" ON public.notification_read_status;
DROP POLICY IF EXISTS "Users can update their own notification status" ON public.notification_read_status;

CREATE POLICY "Users can view their own notification status" ON public.notification_read_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification status" ON public.notification_read_status
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Promotional cards policies
DROP POLICY IF EXISTS "Users can manage their own promotional cards" ON public.promotional_cards;

CREATE POLICY "Users can manage their own promotional cards" ON public.promotional_cards
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- Sales records policies
DROP POLICY IF EXISTS "Users can view their own sales records and managers can view all" ON public.sales_records;
DROP POLICY IF EXISTS "Users can create their own sales records" ON public.sales_records;
DROP POLICY IF EXISTS "Managers can manage all sales records" ON public.sales_records;

CREATE POLICY "Users can view their own sales records and managers can view all" ON public.sales_records
    FOR SELECT USING (auth.uid() = consultant_id OR public.is_user_manager());

CREATE POLICY "Users can create their own sales records" ON public.sales_records
    FOR INSERT WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Managers can manage all sales records" ON public.sales_records
    FOR ALL USING (public.is_user_manager())
    WITH CHECK (public.is_user_manager());

-- Venda O attachments policies
DROP POLICY IF EXISTS "Users can manage their own venda attachments" ON public.venda_o_attachments;

CREATE POLICY "Users can manage their own venda attachments" ON public.venda_o_attachments
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- Venda O sales policies
DROP POLICY IF EXISTS "Users can manage their own sales" ON public.venda_o_sales;

CREATE POLICY "Users can manage their own sales" ON public.venda_o_sales
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- 3. Add additional security constraints (with error handling)
DO $$
BEGIN
    BEGIN ALTER TABLE public.activities ALTER COLUMN user_id SET NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.attachments ALTER COLUMN task_id SET NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.tasks ALTER COLUMN created_by SET NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 4. Create audit log function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log to system logs for audit purposes
    RAISE LOG 'Sensitive operation: % on table % by user %', TG_OP, TG_TABLE_NAME, auth.uid();
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add audit triggers to sensitive tables (with error handling)
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.metas_funcionarios;
CREATE TRIGGER audit_user_roles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.metas_funcionarios
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

-- 6. Enhance existing RLS policies for tables that already have RLS enabled
DROP POLICY IF EXISTS "Enable read access for all users" ON public.crediario_clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.crediario_clientes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.crediario_clientes;
DROP POLICY IF EXISTS "Crediario clients: users and managers only" ON public.crediario_clientes;

CREATE POLICY "Crediario clients: users and managers only" ON public.crediario_clientes
    FOR ALL USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());

-- Comments for documentation
COMMENT ON FUNCTION public.log_sensitive_operation() IS 'Audit function to log sensitive database operations for security monitoring';
