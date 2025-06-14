
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordErrorProps {
  error: string;
  onRetry: () => void;
}

export function ResetPasswordError({ error, onRetry }: ResetPasswordErrorProps) {
  // Security: Don't expose sensitive error details to users
  const getUserFriendlyError = (error: string): string => {
    if (error.includes('invalid') || error.includes('expired')) {
      return "Link de redefinição inválido ou expirado. Solicite um novo link.";
    }
    if (error.includes('network') || error.includes('fetch')) {
      return "Problema de conexão. Verifique sua internet e tente novamente.";
    }
    return "Ocorreu um erro durante a redefinição. Tente novamente mais tarde.";
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-600">Erro na Redefinição</CardTitle>
        <CardDescription>
          Não foi possível redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getUserFriendlyError(error)}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={onRetry}
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
