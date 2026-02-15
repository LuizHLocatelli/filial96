import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema de validação para alteração de email
const emailSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export function EmailForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formulário de alteração de email
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
    },
  });

  // Atualizar formulário quando o usuário for carregado
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        password: "",
      });
    }
  }, [user, form]);

  // Função para atualizar email
  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser(
        { 
          email: data.email 
        },
        { 
          emailRedirectTo: window.location.origin 
        }
      );

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Verifique seu email para confirmar a alteração.",
      });
      form.reset({ email: data.email, password: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar email",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar seu email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu novo email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          Atualizar Email
        </Button>
      </form>
    </Form>
  );
}
