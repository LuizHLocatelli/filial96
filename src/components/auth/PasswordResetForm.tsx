
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardContent, CardFooter } from "@/components/ui/card";

export function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetRequested, setResetRequested] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao solicitar redefinição de senha",
          description: error.message,
        });
        return;
      }

      setResetRequested(true);
      toast({
        title: "Solicitação enviada",
        description: "Verifique seu e-mail para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao solicitar redefinição de senha",
        description: "Ocorreu um erro inesperado ao solicitar redefinição de senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordReset}>
      <CardContent className="space-y-4 pt-6">
        {resetRequested ? (
          <div className="rounded-md bg-accent p-4 border border-border">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  Enviamos um e-mail com instruções para redefinir sua senha. Verifique sua caixa de entrada.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="email-reset" className="text-foreground">E-mail</Label>
            <Input
              id="email-reset"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-input focus-visible:ring-ring"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!resetRequested && (
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            type="submit" 
            disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
