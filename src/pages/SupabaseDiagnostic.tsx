import { SupabaseDiagnostic as DiagnosticComponent } from '@/components/debug/SupabaseDiagnostic';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SupabaseDiagnostic() {
  return (
    <PageLayout>
      <PageHeader 
        title="Diagnóstico do Supabase" 
        description="Verificar conectividade e configurações do Supabase"
      />
      <div className="container mx-auto py-6">
        <DiagnosticComponent />
      </div>
    </PageLayout>
  );
} 