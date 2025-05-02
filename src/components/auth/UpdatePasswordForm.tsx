
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
      // Use updateUser with password instead of signInWithPassword
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi redefinida com sucesso. Você será redirecionado para o dashboard.",
      });
      
      // Redirecionar para o dashboard após atualização bem-sucedida
      setTimeout(() => navigate("/"), 2000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado ao redefinir sua senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
