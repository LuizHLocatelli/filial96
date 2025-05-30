import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, ArrowLeft, RefreshCw } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { useToast } from "@/components/ui/use-toast";

interface MFAChallengeProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showBackButton?: boolean;
}

export function MFAChallenge({ onSuccess, onCancel, showBackButton = true }: MFAChallengeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { challengeAndVerify, loading, factors } = useMFA();
  const { toast } = useToast();

  // Limpar erro quando o código muda
  useEffect(() => {
    if (error) setError("");
  }, [code, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos");
      return;
    }

    try {
      const success = await challengeAndVerify(code);
      if (success) {
        onSuccess?.();
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCodeChange = (value: string) => {
    // Permitir apenas números e limitar a 6 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Verificação de Dois Fatores</CardTitle>
          <CardDescription>
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {totpFactor && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Use o código do aplicativo configurado: {totpFactor.friendly_name || 'Aplicativo Autenticador'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Código de verificação</Label>
              <Input
                id="mfa-code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                disabled={loading || code.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>

              {showBackButton && onCancel && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao login
                </Button>
              )}
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Não consegue acessar seu aplicativo autenticador?
            </p>
            <Button variant="link" className="text-sm h-auto p-0 mt-1">
              Preciso de ajuda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 