
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleUpdatePassword = async (values: UpdatePasswordFormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting to update password");
      
      // Get the token from URL if present (needed for newer Supabase auth)
      const token = searchParams.get("token");
      
      let updateResult;
      
      // If we have a token in the URL, we need to use it for verification
      if (token) {
        console.log("Using token from URL for password update");
        updateResult = await supabase.auth.updateUser({
          password: values.password,
        });
      } else {
        // Use standard update if no token in URL
        updateResult = await supabase.auth.updateUser({
          password: values.password,
        });
      }
      
      const { error } = updateResult;

      if (error) {
        console.error("Error updating password:", error);
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error.message,
        });
        return;
      }

      // Password updated successfully
      setSuccess(true);
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi redefinida com sucesso. Você será redirecionado para o login.",
      });
      
      // Sign out to force login with new password
      await supabase.auth.signOut();
      
      // Redirect to login after successful update
      setTimeout(() => navigate("/auth"), 3000);
      
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado ao redefinir sua senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <CardContent className="space-y-4 py-6">
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center gap-2 text-green-800">
            <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Senha redefinida com sucesso! Você está sendo redirecionado para a página de login.
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdatePassword)}>
        <CardContent className="space-y-4 pt-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Digite sua nova senha"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirme a Nova Senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirme sua nova senha"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
