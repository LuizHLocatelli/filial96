
import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Schema de validação para exclusão de conta
const deleteAccountSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmation: z.literal("excluir minha conta", {
    errorMap: () => ({ message: "Digite 'excluir minha conta' para confirmar" }),
  }),
});

export function DeleteAccountForm() {
  const { user, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formulário de exclusão de conta
  const form = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "" as "excluir minha conta",
    },
  });

  // Função para excluir conta
  const onSubmit = async (data: z.infer<typeof deleteAccountSchema>) => {
    try {
      setLoading(true);
      
      // Tentar fazer login para validar a senha
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.password,
      });

      if (signInError) throw new Error("Senha incorreta");

      // Se o login foi bem-sucedido, chamar o método de exclusão de conta do contexto
      await deleteAccount();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir Conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão excluídos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Digite sua senha para confirmar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme digitando "excluir minha conta"</FormLabel>
                  <FormControl>
                    <Input placeholder="excluir minha conta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive" disabled={loading}>
                  Excluir Permanentemente
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
