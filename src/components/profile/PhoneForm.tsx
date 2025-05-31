
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

// Schema de validação para telefone
const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido"),
});

export function PhoneForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formulário de telefone
  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: profile?.phone || "",
    },
  });

  // Atualizar formulário quando o perfil for carregado
  useEffect(() => {
    if (profile?.phone) {
      form.reset({
        phone: profile.phone,
      });
    }
  }, [profile, form]);

  // Função para atualizar telefone
  const onSubmit = async (data: z.infer<typeof phoneSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Telefone atualizado",
        description: "Seu número de telefone foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar telefone",
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(11) 99999-9999" 
                  type="tel"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          Salvar Telefone
        </Button>
      </form>
    </Form>
  );
}
