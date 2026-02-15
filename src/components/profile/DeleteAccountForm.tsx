
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Schema validation for account deletion
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
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form for account deletion
  const form = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "" as "excluir minha conta",
    },
  });

  // Function to delete account
  const onSubmit = async (data: z.infer<typeof deleteAccountSchema>) => {
    try {
      setLoading(true);
      console.log("Iniciando processo de exclusão de conta via formulário");
      
      // Call the deleteAccount function from auth context
      await deleteAccount(data.password);
      
      // Navigation will be handled inside the deleteAccount function
      setDialogOpen(false);
      
    } catch (error) {
      console.error("Erro capturado no formulário:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro ao excluir sua conta. Por favor, tente novamente.";
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: message,
      });
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  {loading ? "Excluindo..." : "Excluir Permanentemente"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
