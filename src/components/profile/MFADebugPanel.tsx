import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Bug, Trash2, AlertCircle } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { useToast } from "@/components/ui/use-toast";

export function MFADebugPanel() {
  const [showDebug, setShowDebug] = useState(false);
  const { 
    factors, 
    aalInfo, 
    loading, 
    loadFactors, 
    checkAAL, 
    unenroll 
  } = useMFA();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await loadFactors();
      await checkAAL();
      toast({
        title: "Dados atualizados",
        description: "Informações MFA foram recarregadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message,
      });
    }
  };

  const handleCleanupUnverified = async () => {
    try {
      const unverifiedFactors = factors.filter(f => f.status === 'unverified');
      
      if (unverifiedFactors.length === 0) {
        toast({
          title: "Nada para limpar",
          description: "Não há fatores não verificados para remover.",
        });
        return;
      }

      for (const factor of unverifiedFactors) {
        await unenroll(factor.id);
      }

      toast({
        title: "Limpeza concluída",
        description: `${unverifiedFactors.length} fatores não verificados foram removidos.`,
      });

      await loadFactors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na limpeza",
        description: error.message,
      });
    }
  };

  if (!showDebug) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowDebug(true)}
            className="w-full"
          >
            <Bug className="h-4 w-4 mr-2" />
            Mostrar Painel de Debug MFA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Bug className="h-5 w-5" />
          Painel de Debug MFA
        </CardTitle>
        <CardDescription>
          Informações detalhadas sobre o estado do MFA (apenas para desenvolvimento)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ações de Debug */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCleanupUnverified}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Não Verificados
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDebug(false)}
          >
            Ocultar Debug
          </Button>
        </div>

        <Separator />

        {/* Status AAL */}
        <div>
          <h4 className="font-medium mb-2">Authenticator Assurance Level (AAL):</h4>
          {aalInfo ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nível Atual:</span>
                <Badge variant="outline">{aalInfo.currentLevel}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Próximo Nível:</span>
                <Badge variant="outline">{aalInfo.nextLevel}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Métodos:</span>
                <span className="text-xs">
                  {aalInfo.currentAuthenticationMethods.map(method => method.method).join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Informações AAL não disponíveis
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Lista de Fatores */}
        <div>
          <h4 className="font-medium mb-2">Fatores MFA ({factors.length}):</h4>
          {factors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum fator encontrado</p>
          ) : (
            <div className="space-y-2">
              {factors.map((factor, index) => (
                <div key={factor.id} className="p-2 border rounded text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fator #{index + 1}</span>
                    <Badge 
                      variant={factor.status === 'verified' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {factor.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <br />
                      <span className="font-mono">{factor.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <br />
                      <span>{factor.factor_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <br />
                      <span>{factor.friendly_name || 'Sem nome'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criado:</span>
                      <br />
                      <span>{new Date(factor.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  {factor.status === 'unverified' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unenroll(factor.id)}
                      disabled={loading}
                      className="w-full mt-2 h-6 text-xs"
                    >
                      Remover Fator Não Verificado
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Diagnóstico */}
        <div>
          <h4 className="font-medium mb-2">Diagnóstico:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Total de fatores:</span>
              <span>{factors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Fatores verificados:</span>
              <span>{factors.filter(f => f.status === 'verified').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Fatores pendentes:</span>
              <span>{factors.filter(f => f.status === 'unverified').length}</span>
            </div>
            <div className="flex justify-between">
              <span>MFA habilitado:</span>
              <span>{factors.some(f => f.status === 'verified') ? 'Sim' : 'Não'}</span>
            </div>
          </div>
        </div>

        {factors.filter(f => f.status === 'unverified').length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Existem fatores não verificados que podem estar causando problemas. 
              Use a opção "Limpar Não Verificados" para removê-los.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 