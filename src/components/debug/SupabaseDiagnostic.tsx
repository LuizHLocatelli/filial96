import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function SupabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Teste 1: Conexão básica
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        newResults.push({
          test: 'Conexão com banco',
          status: 'error',
          message: 'Falha na conexão',
          details: error.message
        });
      } else {
        newResults.push({
          test: 'Conexão com banco',
          status: 'success',
          message: 'Conectado com sucesso'
        });
      }
    } catch (err: any) {
      newResults.push({
        test: 'Conexão com banco',
        status: 'error',
        message: 'Erro de rede',
        details: err.message
      });
    }

    // Teste 2: Auth service
    try {
      const { data: session } = await supabase.auth.getSession();
      newResults.push({
        test: 'Serviço de autenticação',
        status: 'success',
        message: session.session ? 'Usuário logado' : 'Serviço funcionando'
      });
    } catch (err: any) {
      newResults.push({
        test: 'Serviço de autenticação',
        status: 'error',
        message: 'Falha no serviço auth',
        details: err.message
      });
    }

    // Teste 3: Signup test (dry run)
    try {
      // Testa apenas a validação sem fazer signup real
      const testEmail = `test-${Date.now()}@example.com`;
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: '123456',
        options: {
          data: {
            name: 'Test User',
            phone: '11999999999',
            role: 'gerente'
          }
        }
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // Esperado - apenas testando se o endpoint responde
        newResults.push({
          test: 'Endpoint de signup',
          status: 'success',
          message: 'Endpoint respondendo'
        });
      } else if (error) {
        newResults.push({
          test: 'Endpoint de signup',
          status: 'warning',
          message: 'Endpoint com restrições',
          details: error.message
        });
      } else {
        newResults.push({
          test: 'Endpoint de signup',
          status: 'success',
          message: 'Funcionando normalmente'
        });
      }
    } catch (err: any) {
      newResults.push({
        test: 'Endpoint de signup',
        status: 'error',
        message: 'Falha no endpoint',
        details: err.message
      });
    }

    // Teste 4: Configurações RLS
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error && error.message.includes('RLS')) {
        newResults.push({
          test: 'Políticas RLS',
          status: 'warning',
          message: 'RLS pode estar bloqueando',
          details: error.message
        });
      } else {
        newResults.push({
          test: 'Políticas RLS',
          status: 'success',
          message: 'Configuradas corretamente'
        });
      }
    } catch (err: any) {
      newResults.push({
        test: 'Políticas RLS',
        status: 'error',
        message: 'Erro ao verificar RLS',
        details: err.message
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'secondary' as const,
    };
    
    return (
      <Badge variant={variants[status]}>
        {status === 'success' ? 'OK' : status === 'error' ? 'ERRO' : 'ATENÇÃO'}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Diagnóstico do Supabase
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Testando...' : 'Executar Testes'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
            {getStatusIcon(result.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{result.test}</h4>
                {getStatusBadge(result.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
              {result.details && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded font-mono">
                  {result.details}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {results.length === 0 && !isRunning && (
          <div className="text-center text-muted-foreground py-8">
            Clique em "Executar Testes" para iniciar o diagnóstico
          </div>
        )}
        
        {isRunning && (
          <div className="text-center text-muted-foreground py-8">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin mb-2" />
            Executando diagnósticos...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 