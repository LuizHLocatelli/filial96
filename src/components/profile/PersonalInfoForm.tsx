
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

// Schema de validação para informações pessoais
const personalInfoSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  displayName: z.string().min(2, "Nome de exibição deve ter pelo menos 2 caracteres"),
});

export function PersonalInfoForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formulário de informações pessoais
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: profile?.name || "",
      displayName: profile?.displayName || "",
    },
  });

  // Atualizar formulário quando o perfil for carregado
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.name,
        displayName: profile.displayName || profile.name.split(" ")[0],
      });
    }
  }, [profile, form]);

  // Função para atualizar informações pessoais
  const onSubmit = async (data: z.infer<typeof personalInfoSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.fullName,
          display_name: data.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como deseja ser chamado</FormLabel>
              <FormControl>
                <Input placeholder="Digite como deseja ser chamado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          Salvar Alterações
        </Button>
      </form>
    </Form>
  );
}
