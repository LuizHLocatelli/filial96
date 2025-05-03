
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { passwordResetSchema, type PasswordResetFormValues } from "./schemas/passwordResetSchema";

export function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const handlePasswordReset = async (values: PasswordResetFormValues) => {
    setIsLoading(true);
    try {
      // Get the absolute URL for the redirect
      const origin = window.location.origin;
      
      // Configure exact and complete URL for redirection
      // This ensures the token is processed correctly
      const redirectTo = `${origin}/reset-password`;
      
      console.log("Solicitando redefinição de senha para:", values.email);
      console.log("URL de redirecionamento configurado:", redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("Erro na solicitação de redefinição de senha:", error);
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
      console.error("Erro inesperado durante a solicitação de redefinição de senha:", error);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePasswordReset)}>
        <CardContent className="space-y-4 pt-6">
          {resetRequested ? (
            <Alert variant="default" className="bg-accent border-border">
              <AlertDescription className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  Enviamos um e-mail com instruções para redefinir sua senha. Verifique sua caixa de entrada.
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    </Form>
  );
}
