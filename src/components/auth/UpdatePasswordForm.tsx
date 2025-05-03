
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
import { useNavigate } from "react-router-dom";
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

interface UpdatePasswordFormProps {
  token?: string | null;
  hash?: string;
}

export function UpdatePasswordForm({ token, hash }: UpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
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
      console.log("Iniciando atualização de senha");
      
      // Verificar diversos formatos possíveis de token
      const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
      const accessToken = hashParams?.get("access_token");
      const type = hashParams?.get("type");
      const refreshToken = hashParams?.get("refresh_token") || "";
      
      console.log("Formato do token:", { 
        hash: hash ? "presente" : "ausente", 
        accessToken: accessToken ? "presente" : "ausente",
        token: token ? "presente" : "ausente",
        type: type || "ausente",
      });

      // Se temos access_token no hash, tentar configurar sessão
      if (accessToken) {
        console.log("Configurando sessão com access_token do hash");
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error("Erro ao configurar sessão:", sessionError);
            toast({
              variant: "destructive",
              title: "Erro ao validar token de recuperação",
              description: "O link de recuperação pode estar expirado ou inválido. Por favor, solicite um novo.",
            });
            setTimeout(() => navigate("/auth"), 3000);
            return;
          }
          
          console.log("Sessão configurada com sucesso");
        } catch (err) {
          console.error("Erro ao configurar sessão:", err);
        }
      }
      
      // Se temos um token padrão, tentar usá-lo para atualizar a senha
      if (token) {
        console.log("Usando token padrão para atualizar senha");
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });
        
        if (error) {
          console.error("Erro ao atualizar senha com token padrão:", error);
          toast({
            variant: "destructive",
            title: "Erro ao atualizar senha",
            description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
          });
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }
      } else {
        // Caso não tenhamos token específico, tentar atualizar a senha diretamente
        // Isso usa a sessão configurada anteriormente com setSession ou o token da URL
        console.log("Tentando atualizar senha com sessão atual");
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });
        
        if (error) {
          console.error("Erro ao atualizar senha:", error);
          toast({
            variant: "destructive",
            title: "Erro ao atualizar senha",
            description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
          });
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }
      }

      // Senha atualizada com sucesso
      console.log("Senha atualizada com sucesso");
      setSuccess(true);
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi redefinida. Você será redirecionado para o login.",
      });
      
      // Deslogar para forçar login com a nova senha
      await supabase.auth.signOut();
      
      // Redirecionar para login após atualização bem-sucedida
      setTimeout(() => navigate("/auth"), 3000);
      
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado ao redefinir sua senha. Por favor, tente novamente.",
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
